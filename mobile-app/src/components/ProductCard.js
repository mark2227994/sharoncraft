import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ProductCard = ({ product, onPress }) => {
  const formatPrice = (price) => {
    return `KES ${price.toLocaleString()}`;
  };

  const renderBadge = () => {
    if (!product.badge) return null;
    
    return (
      <View style={[styles.badge, { backgroundColor: '#ff6f61' }]}>
        <Text style={styles.badgeText}>{product.badge}</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={typeof product.image === 'string' ? { uri: product.image } : product.image}
          style={styles.image}
          resizeMode="cover"
        />
        {renderBadge()}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>
          {formatPrice(product.price)}
        </Text>
        {product.newArrival && (
          <Text style={styles.newBadge}>New</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 8,
    marginVertical: 8,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a4a4a',
    marginBottom: 4,
    lineHeight: 18,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6f61',
  },
  newBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1abc9c',
    marginTop: 4,
  },
});

export default ProductCard;
