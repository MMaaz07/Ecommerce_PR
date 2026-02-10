from django.shortcuts import render
from django.http import JsonResponse
from .models import Products, Category, Cart, CartItem, Order, OrderItem
from .serializers import ProductSerializer, CategorySerializer, CartItemSerializer, CartSerializer, UserSerializer, RegisterSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework.response import Response

# Create your views here.
def home(request):
    data={
        'message':'Welcome to Ecommerce Project',
    }
    return JsonResponse(data)

@api_view(['GET'])
def get_products(request):
    products = Products.objects.select_related('category').all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_categories(request):
    categories = Category.objects.prefetch_related('products').all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_product(request, pk):
    try:
        product = Products.objects.select_related('category').get(id=pk)
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)
    except Products.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    cart, created = Cart.objects.prefetch_related(
        'items__product'
    ).get_or_create(user=request.user)

    serializer = CartSerializer(cart)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get('product_id')
    product = Products.objects.select_related('category').get(id=product_id)

    cart, created = Cart.objects.get_or_create(user=request.user)

    item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product
    )

    if not created:
        item.quantity += 1
        item.save()

    cart = Cart.objects.prefetch_related('items__product').get(id=cart.id)
    return Response({
        'message': 'Product added to cart',
        'cart': CartSerializer(cart).data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_cart_quantity(request):
    item_id=request.data.get('item_id')
    quantity=request.data.get('quantity')

    if not item_id or quantity is None:
        return Response({'message':'Item ID and quantity are required'}, status=400)

    try:
        item=CartItem.objects.get(id=item_id)
        quantity=int(quantity)
        if quantity<1:
            item.delete()
            return Response({'error':'Quantity must be atleast 1'}, status=400)
        
        item.quantity=quantity
        item.save()
        serializer=CartItemSerializer(item)
        return Response(serializer.data)
    except CartItem.DoesNotExist:
        return Response({'error':'Cart item not found'}, status=404)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request):
    item_id=request.data.get('item_id')
    CartItem.objects.filter(id=item_id).delete()
    return Response({'message':'Item Removed form cart'})



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    try:
        cart = Cart.objects.prefetch_related(
            'items__product'
        ).get(user=request.user)

        if not cart.items.exists():
            return Response({'error': 'Cart is Empty'}, status=400)

        total = sum(
            item.product.price * item.quantity
            for item in cart.items.all()
        )

        order = Order.objects.create(
            user=request.user,
            total_amount=total
        )
        OrderItem.objects.bulk_create([
            OrderItem(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )
            for item in cart.items.all()
        ])

        cart.items.all().delete()
        return Response({
            'message': 'Order created successfully',
            'order_id': order.id
        })

    except Exception as e:
        return Response({'error': str(e)}, status=500)
        


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer=RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user=serializer.save()
        return Response({'message':'User Created Successfully', 'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

