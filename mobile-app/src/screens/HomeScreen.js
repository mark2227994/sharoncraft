import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { selectFeaturedProducts, selectNewArrivals, fetchProductsStart } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const featuredProducts = useSelector(selectFeaturedProducts);
  const newArrivals = useSelector(selectNewArrivals);

  // Mock data - replace with API calls
  const categories = [
    {
      id: '1',
      name: 'Necklaces',
      image: require('../../assets/icons/necklaces.png'),
      tip: 'Statement style',
      accent: '#ff6f61',
    },
    {
      id: '2',
      name: 'Bracelets',
      image: require('../../assets/icons/bracelets.png'),
      tip: 'Easy gifting',
      accent: '#1abc9c',
    },
    {
      id: '3',
      name: 'Home Decor',
      image: require('../../assets/icons/home-decor.png'),
      tip: 'Warm spaces',
      accent: '#f2c94c',
    },
    {
      id: '4',
      name: 'Bags & Accessories',
      image: require('../../assets/icons/bags-accessories.png'),
      tip: 'Daily carry',
      accent: '#d96c48',
    },
    {
      id: '5',
      name: 'Gift Sets',
      image: require('../../assets/icons/gift-sets.png'),
      tip: 'Ready gifts',
      accent: '#1abc9c',
    },
    {
      id: '6',
      name: 'Bridal & Occasion',
      image: require('../../assets/icons/bridal-occasion.png'),
      tip: 'Event glow',
      accent: '#ff6f61',
    },
  ];

  const handleCategoryPress = (category) => {
    navigation.navigate('Shop', { category: category.name });
  };

  const handleProductPress = (product) => {
    navigation.navigate('Product', { productId: product.id });
  };

  const renderHeroSection = () => (
    <LinearGradient
      colors={['#ff6f61', '#d96c48']}
      style={styles.heroGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.heroContent}>
        <Text style={styles.heroTitle}>SharonCraft</Text>
        <Text style={styles.heroSubtitle}>Clean, colorful handmade beadwork</Text>
        <TouchableOpacity 
          style={styles.heroButton}
          onPress={() => navigation.navigate('Shop')}
        >
          <Text style={styles.heroButtonText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderCategories = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Shop by Category</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onPress={() => handleCategoryPress(category)}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderFeaturedProducts = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Featured Products</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsContainer}
      >
        {featuredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() => handleProductPress(product)}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderHeroSection()}
      {renderCategories()}
      {renderFeaturedProducts()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff5e1',
  },
  heroGradient: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 24,
  },
  heroButton: {
    backgroundColor: '#fff5e1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  heroButtonText: {
    color: '#ff6f61',
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a4a4a',
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingRight: 20,
  },
  productsContainer: {
    paddingRight: 20,
  },
});

export default HomeScreen;
