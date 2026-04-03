import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Share, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { addToCart } from '../store/slices/cartSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';

const ProductScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const productId = route.params?.productId;

  useEffect(() => {
    // Mock product data - replace with API call
    const mockProduct = {
      id: productId,
      name: 'Traditional Maasai Necklace',
      price: 3500,
      description: 'Handcrafted with vibrant beads and traditional patterns, this necklace represents the rich cultural heritage of Kenyan beadwork.',
      images: [
        require('../../assets/images/product1.jpg'),
        require('../../assets/images/product2.jpg'),
        require('../../assets/images/product3.jpg'),
      ],
      specifications: [
        'Handmade in Kenya',
        'High-quality beads',
        'Adjustable length',
        'Cultural design',
      ],
      category: 'Necklaces',
      inStock: true,
      badge: 'Best Seller',
    };
    setProduct(mockProduct);
  }, [productId]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to add items to cart',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    dispatch(addToCart({ ...product, quantity }));
    setIsAddedToCart(true);
    
    setTimeout(() => {
      setIsAddedToCart(false);
    }, 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${product.name} from SharonCraft! KES ${product.price}`,
        url: `https://sharoncraft.co.ke/product/${productId}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share product');
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to make a purchase',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    // Navigate to checkout or initiate M-Pesa payment
    navigation.navigate('Cart');
  };

  const formatPrice = (price) => {
    return `KES ${price.toLocaleString()}`;
  };

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageScrollContainer}
        >
          {product.images.map((image, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.imageThumb,
                selectedImageIndex === index && styles.selectedImageThumb
              ]}
              onPress={() => setSelectedImageIndex(index)}
            >
              <Image 
                source={image}
                style={styles.thumbImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.mainImageContainer}>
        <Image 
          source={product.images[selectedImageIndex]}
          style={styles.mainImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{product.name}</Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.price}>{formatPrice(product.price)}</Text>

        <View style={styles.badgeContainer}>
          {product.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{product.badge}</Text>
            </View>
          )}
          {product.inStock && (
            <View style={styles.stockBadge}>
              <Text style={styles.stockText}>In Stock</Text>
            </View>
          )}
        </View>

        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.specsContainer}>
          <Text style={styles.specsTitle}>Specifications:</Text>
          {product.specifications.map((spec, index) => (
            <Text key={index} style={styles.specItem}>• {spec}</Text>
          ))}
        </View>

        <View style={styles.actionContainer}>
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.addToCartButton,
              isAddedToCart && styles.addedToCartButton
            ]}
            onPress={handleAddToCart}
            disabled={isAddedToCart}
          >
            <Text style={styles.addToCartText}>
              {isAddedToCart ? 'Added to Cart ✓' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.buyNowButton}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyNowText}>Buy Now - M-Pesa</Text>
        </TouchableOpacity>
      </View>
    </View>
  </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff5e1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: 80,
    marginBottom: 16,
  },
  imageScrollContainer: {
    paddingRight: 16,
  },
  imageThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedImageThumb: {
    borderColor: '#ff6f61',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  mainImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mainImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  infoContainer: {
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a4a4a',
    flex: 1,
  },
  shareButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  shareButtonText: {
    color: '#4a4a4a',
    fontSize: 14,
    fontWeight: '600',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff6f61',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#ff6f61',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  stockBadge: {
    backgroundColor: '#1abc9c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  stockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 24,
  },
  specsContainer: {
    marginBottom: 24,
  },
  specsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a4a4a',
    marginBottom: 8,
  },
  specItem: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  actionContainer: {
    marginBottom: 32,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    color: '#4a4a4a',
    marginRight: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a4a4a',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a4a4a',
    paddingHorizontal: 20,
  },
  addToCartButton: {
    backgroundColor: '#1abc9c',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  addedToCartButton: {
    backgroundColor: '#27ae60',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buyNowButton: {
    backgroundColor: '#ff6f61',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  buyNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductScreen;
