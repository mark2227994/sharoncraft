import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { selectProducts, selectCategories, selectFilters, setFilter, fetchProductsStart } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import FilterBar from '../components/FilterBar';

const ShopScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const categories = useSelector(selectCategories);
  const filters = useSelector(selectFilters);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Set initial category from navigation params
    if (route.params?.category) {
      dispatch(setFilter({ category: route.params.category }));
    }
    
    // Load initial data
    dispatch(fetchProductsStart());
  }, [dispatch, route.params]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    dispatch(setFilter({ searchQuery: query }));
  };

  const handleCategoryFilter = (category) => {
    dispatch(setFilter({ category }));
  };

  const handleProductPress = (product) => {
    navigation.navigate('Product', { productId: product.id });
  };

  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
    />
  );

  const renderHeader = () => (
    <View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            !filters.category && styles.activeCategoryChip
          ]}
          onPress={() => handleCategoryFilter(null)}
        >
          <Text style={styles.categoryChipText}>All</Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              filters.category === category.name && styles.activeCategoryChip
            ]}
            onPress={() => handleCategoryFilter(category.name)}
          >
            <Text style={styles.categoryChipText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff5e1',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoriesContainer: {
    paddingRight: 16,
    marginBottom: 16,
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeCategoryChip: {
    backgroundColor: '#ff6f61',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a4a4a',
  },
  productsContainer: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
});

export default ShopScreen;
