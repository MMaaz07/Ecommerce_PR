from django.shortcuts import render
from django.http import JsonResponse
from .models import Products, Category, Cart, CartItem
from .serializers import ProductSerializer, CategorySerializer, CartItemSerializer, CartSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Create your views here.
def home(request):
    data={
        'message':'Welcome to Ecommerce Project',
    }
    return JsonResponse(data)

@api_view(['GET'])
def get_products(request):
    products=Products.objects.all()
    serializer= ProductSerializer(products,many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_categories(request):
    categories=Category.objects.all()
    serializer=CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_product(request,pk):
    try:
        product=Products.objects.get(id=pk)
        serializer=ProductSerializer(product, context={'request':request})
        return Response(serializer.data)
    except Products.DoesNotExist:
        return Response({'error':'Product not found'}, status=404)

@api_view(['GET'])
def get_cart(requets):
    cart, created=Cart.objects.get_or_create(user=None)
    serializer=CartSerializer(cart)
    return Response(serializer.data)

@api_view(['POST'])
def add_to_cart(request):
    product_id=request.data.get('product_id')
    product=Products.objects.get(id=product_id)
    cart, created=Cart.objects.get_or_create(user=None)
    item, created=CartItem.objects.get_or_create(cart=cart, product=product)
    if not created:
        item.quantity+=1
        item.save()
    return Response({'message':'Product added to cart', "cart":CartSerializer(cart).data})

@api_view(['POST'])
def remove_from_cart(request):
    item_id=request.data.get('item_id')
    CartItem.objects.filter(id=item_id).delete()
    return Response({'message':'Item Removed form cart'})