
import React, { useState, useRef } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { productService } from '../services/productService';
import { storageService } from '../services/storageService';
import { Product, ProductFormData } from '../types/Product';

const Admin: React.FC = () => {
  const { products, loading, error, refreshProducts } = useProducts();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const createEmptyGrid = () => Array.from({ length: 5 }, () => Array(5).fill('')) as string[][];
  const normalizeGrid = (grid?: string[][]) => {
    const base = Array.from({ length: 5 }, () => Array(5).fill('')) as string[][];
    if (!Array.isArray(grid)) return base;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        base[r][c] = grid?.[r]?.[c] ?? '';
      }
    }
    return base;
  };

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    product_details: '',
    size_chart: createEmptyGrid(),
    price: 0,
    images: [''],
    colors: [{ name: '', value: '#000000', imageIndex: undefined }],
    sizes: [],
    category: 'Dresses'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<boolean[]>([]);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      product_details: '',
      size_chart: createEmptyGrid(),
      price: 0,
      images: [''],
      colors: [{ name: '', value: '#000000', imageIndex: undefined }],
      sizes: [],
      category: 'Dresses'
    });
    setUploadingImages([]);
    fileInputRefs.current = [];
    setIsAddingProduct(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log('Form submission - Full formData:', formData);
    console.log('Product Details field value:', formData.product_details);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        alert('Product name is required.');
        return;
      }
      if (formData.price <= 0) {
        alert('Product price must be greater than 0.');
        return;
      }

      // Filter out empty images
      const cleanedData = {
        ...formData,
        images: formData.images.filter(img => img.trim() !== ''),
        colors: formData.colors.filter(color => color.name.trim() !== ''),
      };

      // Ensure at least one image
      if (cleanedData.images.length === 0) {
        alert('At least one product image is required.');
        return;
      }

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, cleanedData);
        alert('Product updated successfully!');
      } else {
        await productService.addProduct(cleanedData);
        alert('Product added successfully!');
      }
      
      // Refresh the product list so changes appear immediately in shop
      refreshProducts();
      resetForm();
    } catch (err) {
      console.error('Error saving product:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Error saving product. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('permission-denied')) {
          errorMessage = 'Permission denied. Please check your Firebase security rules.';
        } else if (err.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.message.includes('auth')) {
          errorMessage = 'Authentication error. Please ensure you are logged in.';
        } else {
          errorMessage = `Error: ${err.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    console.log('Editing product - full product object:', product);
    console.log('Product details from server:', (product as any).product_details);
    
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      product_details: (product as any).product_details || '',
      size_chart: normalizeGrid((product as any).size_chart),
      price: product.price,
      images: product.images.length > 0 ? product.images : [''],
      colors: product.colors.length > 0 ? product.colors : [{ name: '', value: '#000000', imageIndex: undefined }],
      sizes: product.sizes,
      category: product.category as 'Dresses' | 'Tops' | 'Bottoms' | 'Accessories' | 'Sets'
    });
    setUploadingImages(new Array(product.images.length || 1).fill(false));
    setIsAddingProduct(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        alert('Product deleted successfully!');
        // Refresh the product list so changes appear immediately in shop
        refreshProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Error deleting product. Please try again.');
      }
    }
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
    setUploadingImages(prev => [...prev, false]);
  };

  const removeImageField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setUploadingImages(prev => prev.filter((_, i) => i !== index));
    fileInputRefs.current = fileInputRefs.current.filter((_, i) => i !== index);
  };

  const updateImageField = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };

  const handleImageUpload = async (index: number, file: File) => {
    console.log('handleImageUpload called with:', { index, fileName: file.name, fileSize: file.size });
    
    if (!file) {
      console.log('No file provided');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      console.log('Invalid file type:', file.type);
      return;
    }

    // Validate image using our new storage service
    const validation = storageService.validateImage(file);
    if (!validation.valid) {
      alert(validation.error);
      console.log('Image validation failed:', validation.error);
      return;
    }

    try {
      console.log('Starting image upload...');
      setUploadingImages(prev => prev.map((uploading, i) => i === index ? true : uploading));
      
      // Generate unique path for the image
      const productId = editingProduct?.id || `temp_${Date.now()}`;
      const imagePath = storageService.generateImagePath(productId, index, file);
      console.log('Generated image path:', imagePath);
      
      // Upload image and get base64 data URL
      const imageDataUrl = await storageService.uploadImage(file, imagePath);
      console.log('Upload successful, data URL length:', imageDataUrl.length);
      
      // Update the form data with the base64 data URL
      updateImageField(index, imageDataUrl);
      
      alert('Image uploaded successfully!');
      
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Provide specific error guidance
      let errorMessage = 'Error uploading image.';
      
      if (error instanceof Error) {
        errorMessage = `Upload error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setUploadingImages(prev => prev.map((uploading, i) => i === index ? false : uploading));
    }
  };

  const triggerFileInput = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { name: '', value: '#000000', imageIndex: undefined }]
    }));
  };

  const removeColorField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const updateColorField = (index: number, field: 'name' | 'value' | 'imageIndex', value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((color, i) => 
        i === index ? { ...color, [field]: value } : color
      )
    }));
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const availableSizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Product Admin</h1>
          <button
            onClick={() => setIsAddingProduct(true)}
            className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Product Form */}
        {isAddingProduct && (
          <div className="bg-gray-50 border border-black p-6 rounded mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'Dresses' | 'Sets' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  >
                    <option value="Dresses">Dresses</option>
                    <option value="Sets">Sets</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Product Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter a detailed description of the product..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black resize-vertical"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Describe the product features, materials, fit, and care instructions.
                </p>
              </div>

              {/* Product Details */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Product Details
                </label>
                <textarea
                  value={formData.product_details || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_details: e.target.value }))}
                  placeholder="Enter detailed product specifications, materials, care instructions, sizing info..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black resize-vertical"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Additional product information that will appear in the expandable Product Details section.
                </p>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Product Images
                </label>
                <p className="text-xs text-red-600 mb-3">
                  ⚠️ Firebase Storage CORS error detected. Please update Firebase Storage rules to allow all access temporarily:
                  <br />
                  <code className="text-xs bg-gray-100 p-1 rounded">allow read, write: if true;</code>
                </p>
                {formData.images.map((image, index) => (
                  <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex space-x-3 mb-3">
                      {/* Image Preview */}
                      <div className="w-20 h-20 border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                        {image ? (
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              const nextElement = target.nextElementSibling as HTMLElement;
                              target.style.display = 'none';
                              if (nextElement) nextElement.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        {!image && (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                                            {/* Upload Only */}
                      <div className="flex-1 space-y-2">
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => triggerFileInput(index)}
                            disabled={uploadingImages[index]}
                            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Upload className="w-4 h-4" />
                            <span>{uploadingImages[index] ? 'Uploading...' : 'Upload Image'}</span>
                          </button>
                          
                          {formData.images.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeImageField(index)}
                              className="px-3 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <input
                          ref={(el) => fileInputRefs.current[index] = el}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(index, file);
                            }
                          }}
                          className="hidden"
                        />
                        
                        {image && (
                          <p className="text-xs text-gray-500">
                            Image {index + 1} uploaded successfully
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {image && (image.startsWith('https://') || image.startsWith('data:')) && (
                      <p className="text-xs text-green-600">
                        ✓ Image uploaded successfully
                      </p>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded px-3 py-2 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Image</span>
                </button>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Available Colors
                </label>
                {formData.colors.map((color, index) => (
                  <div key={index} className="flex space-x-2 mb-3 p-3 border border-gray-200 rounded-lg">
                    <input
                      type="text"
                      value={color.name}
                      onChange={(e) => updateColorField(index, 'name', e.target.value)}
                      placeholder="Color name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                    />
                    <input
                      type="color"
                      value={color.value}
                      onChange={(e) => updateColorField(index, 'value', e.target.value)}
                      className="w-16 h-10 border border-gray-300 rounded"
                    />
                    <select
                      value={color.imageIndex ?? ''}
                      onChange={(e) => updateColorField(index, 'imageIndex', e.target.value === '' ? undefined : parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                    >
                      <option value="">No specific image</option>
                      {formData.images.map((image, imgIndex) => (
                        image && (
                          <option key={imgIndex} value={imgIndex}>
                            Image {imgIndex + 1}
                          </option>
                        )
                      ))}
                    </select>
                    {formData.colors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColorField(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addColor}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Another Color
                </button>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Available Sizes
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-2 border rounded text-sm transition-colors ${
                        formData.sizes.includes(size)
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Chart (5x5) */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Size Chart (5 x 5)
                </label>
                <div className="overflow-auto">
                  <table className="min-w-full border border-gray-300">
                    <tbody>
                      {formData.size_chart?.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="border border-gray-300 p-1">
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setFormData(prev => {
                                    const grid = normalizeGrid(prev.size_chart).map(r => [...r]);
                                    grid[rIdx][cIdx] = value;
                                    return { ...prev, size_chart: grid };
                                  });
                                }}
                                className="w-24 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-black text-sm"
                                placeholder={rIdx === 0 ? (cIdx === 0 ? 'Header' : `H${cIdx}`) : ''}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, size_chart: createEmptyGrid() }))}
                    className="text-sm px-3 py-1 border border-gray-300 rounded hover:border-black"
                  >
                    Clear Grid
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Product'}</span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded hover:border-black transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-black">Products ({products.length})</h2>
          
          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No products found. Add your first product to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded p-4">
                  <div className="aspect-square mb-4 overflow-hidden rounded">
                    <img
                      src={product.images[0] || '/assets/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-2">${product.price}</p>
                  <p className="text-sm text-gray-500 mb-2">Category: {product.category}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Colors: {product.colors.map(c => c.name).join(', ')}
                  </p>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
