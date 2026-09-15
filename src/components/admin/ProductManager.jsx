"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RiCloseLine, RiDeleteBinLine, RiEdit2Line, RiImageAddLine, RiImageLine, RiRefreshLine } from "react-icons/ri";

const MAX_PRODUCT_IMAGES = 8;

const EMPTY_FORM = {
  uuid: null,
  name: "",
  category_uuid: "",
  price: "",
  sale_price: "",
  quantity: "0",
  description: "",
  status: true,
  existingImages: [],
  newImages: [],
  removeImageIds: [],
};

const flattenCategories = (categories = []) => {
  const result = [];
  categories.forEach((category) => {
    result.push({ uuid: category.uuid || category.id, name: category.name, parent: null, status: category.status });
    (category.subcategories || []).forEach((sub) => {
      result.push({ uuid: sub.uuid || sub.id, name: sub.name, parent: category.name, status: sub.status });
    });
  });
  return result;
};

const isActive = (value) => Number(value) === 1 || value === true;

export default function ProductManager() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category") || "";
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ ...EMPTY_FORM, category_uuid: categoryFromUrl });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);

  const categoryOptions = useMemo(() => flattenCategories(categories), [categories]);
  const selectedCategoryName = categoryOptions.find((item) => item.uuid === categoryFromUrl)?.name;

  const loadCategories = useCallback(async () => {
    const response = await fetch("/api/category?paginate=500", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to load categories");
    setCategories(result.data || []);
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ paginate: "500" });
      if (categoryFromUrl) query.set("category", categoryFromUrl);
      const response = await fetch(`/api/product?${query.toString()}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to load products");
      setProducts(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    Promise.all([loadCategories(), loadProducts()]).catch((err) => setError(err.message));
  }, [loadCategories, loadProducts]);

  useEffect(() => {
    if (!form.uuid && categoryFromUrl) {
      setForm((value) => ({ ...value, category_uuid: categoryFromUrl }));
    }
  }, [categoryFromUrl, form.uuid]);

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      [product.name, product.categories?.[0]?.name].some((value) => String(value || "").toLowerCase().includes(term))
    );
  }, [products, search]);

  const resetForm = () => {
    setForm({ ...EMPTY_FORM, category_uuid: categoryFromUrl });
    setFileInputKey((value) => value + 1);
  };

  const editProduct = (product) => {
    const existingImages = (product.product_galleries || [])
      .filter((image) => image?.original_url && image?.uuid)
      .map((image) => ({ id: image.uuid, url: image.original_url }));

    setMessage("");
    setError("");
    setForm({
      uuid: product.uuid || product.id,
      name: product.name || "",
      category_uuid: product.category_uuid || product.categories?.[0]?.uuid || product.categories?.[0]?.id || "",
      price: product.price ?? "",
      sale_price: product.sale_price !== product.price ? product.sale_price ?? "" : "",
      quantity: product.quantity ?? 0,
      description: product.description || "",
      status: isActive(product.status),
      existingImages,
      newImages: [],
      removeImageIds: [],
    });
    setFileInputKey((value) => value + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onImagesChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const currentCount = form.existingImages.length - form.removeImageIds.length + form.newImages.length;
    if (currentCount + files.length > MAX_PRODUCT_IMAGES) {
      setError(`You can upload up to ${MAX_PRODUCT_IMAGES} images per product`);
      setFileInputKey((value) => value + 1);
      return;
    }

    const invalid = files.find((file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024);
    if (invalid) {
      setError(!invalid.type.startsWith("image/") ? "Please choose image files only" : "Each product image must be 5 MB or smaller");
      setFileInputKey((value) => value + 1);
      return;
    }

    setError("");
    const items = files.map((file) => ({
      key: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    setForm((value) => ({ ...value, newImages: [...value.newImages, ...items] }));
    setFileInputKey((value) => value + 1);
  };

  const removeExistingImage = (imageId) => {
    setForm((value) => ({
      ...value,
      removeImageIds: value.removeImageIds.includes(imageId) ? value.removeImageIds : [...value.removeImageIds, imageId],
    }));
  };

  const restoreExistingImage = (imageId) => {
    setForm((value) => ({ ...value, removeImageIds: value.removeImageIds.filter((id) => id !== imageId) }));
  };

  const removeNewImage = (key) => {
    setForm((value) => {
      const target = value.newImages.find((item) => item.key === key);
      if (target?.preview?.startsWith("blob:")) URL.revokeObjectURL(target.preview);
      return { ...value, newImages: value.newImages.filter((item) => item.key !== key) };
    });
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const editing = Boolean(form.uuid);
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("category_uuid", form.category_uuid);
      payload.append("price", form.price);
      payload.append("sale_price", form.sale_price);
      payload.append("quantity", form.quantity);
      payload.append("description", form.description);
      payload.append("status", form.status ? "1" : "0");
      form.newImages.forEach((item) => payload.append("images", item.file));
      form.removeImageIds.forEach((id) => payload.append("remove_image_ids", id));

      const response = await fetch(editing ? `/api/product/${form.uuid}` : "/api/product", {
        method: editing ? "PATCH" : "POST",
        body: payload,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to save product");
      setMessage(editing ? "Product updated successfully" : "Product created successfully");
      form.newImages.forEach((item) => item.preview?.startsWith("blob:") && URL.revokeObjectURL(item.preview));
      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/product/${product.uuid || product.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to delete product");
      if (form.uuid === (product.uuid || product.id)) resetForm();
      setMessage("Product deleted successfully");
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const activeExistingCount = form.existingImages.filter((image) => !form.removeImageIds.includes(image.id)).length;
  const totalSelectedImages = activeExistingCount + form.newImages.length;

  return (
    <div className="card-spacing">
      {(message || error) && <div className={`alert ${error ? "alert-danger" : "alert-success"} mb-4`}>{error || message}</div>}

      <div className="row g-4">
        <div className="col-xl-7">
          <div className="card">
            <div className="card-body">
              <div className="title-header option-title admin-product-title-row">
                <div>
                  <h5>{selectedCategoryName ? `${selectedCategoryName} Products` : "Products"}</h5>
                  {categoryFromUrl ? <a href="/admin/product" className="admin-clear-filter">View all products</a> : null}
                </div>
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={loadProducts}><RiRefreshLine /> Refresh</button>
              </div>

              <div className="mb-3">
                <input className="form-control" placeholder="Search Product" value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>

              {loading ? (
                <div className="admin-content-loading">Loading products...</div>
              ) : visibleProducts.length ? (
                <div className="table-responsive">
                  <table className="table all-package theme-table product-table align-middle">
                    <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {visibleProducts.map((product) => {
                        const imageUrl = product.product_thumbnail?.original_url || "/assets/images/placeholder/product.png";
                        return (
                          <tr key={product.uuid || product.id}>
                            <td><div className="admin-product-cell"><img src={imageUrl} alt={product.name} /><span>{product.name}</span></div></td>
                            <td>{product.categories?.[0]?.name || "-"}</td>
                            <td>₹{Number(product.sale_price ?? product.price ?? 0).toFixed(2)}</td>
                            <td>{product.quantity ?? 0}</td>
                            <td><span className={`badge ${isActive(product.status) ? "badge-success" : "badge-danger"}`}>{isActive(product.status) ? "Active" : "Inactive"}</span></td>
                            <td>
                              <div className="admin-product-actions">
                                <button type="button" title="Edit product" onClick={() => editProduct(product)}><RiEdit2Line /></button>
                                <button type="button" className="delete" title="Delete product" onClick={() => removeProduct(product)}><RiDeleteBinLine /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="admin-empty-category"><RiImageLine /><div>No products found</div></div>
              )}
            </div>
          </div>
        </div>

        <div className="col-xl-5">
          <div className="card admin-product-form-card">
            <div className="card-body">
              <div className="title-header option-title"><h5>{form.uuid ? "Edit Product" : "Add Product"}</h5></div>
              <form onSubmit={save} className="theme-form theme-form-2 mega-form">
                <div className="mb-4">
                  <label className="form-label-title">Name <span className="text-danger">*</span></label>
                  <input className="form-control" value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} placeholder="Enter Product Name" required />
                </div>

                <div className="mb-4">
                  <label className="form-label-title">Category / Subcategory <span className="text-danger">*</span></label>
                  <select className="form-select" value={form.category_uuid} onChange={(e) => setForm((v) => ({ ...v, category_uuid: e.target.value }))} required>
                    <option value="">Select Category</option>
                    {categoryOptions.map((category) => <option key={category.uuid} value={category.uuid}>{category.parent ? `${category.parent} > ${category.name}` : category.name}</option>)}
                  </select>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-4"><label className="form-label-title">Price <span className="text-danger">*</span></label><input type="number" min="0" step="0.01" className="form-control" value={form.price} onChange={(e) => setForm((v) => ({ ...v, price: e.target.value }))} required /></div>
                  <div className="col-md-6 mb-4"><label className="form-label-title">Sale Price</label><input type="number" min="0" step="0.01" className="form-control" value={form.sale_price} onChange={(e) => setForm((v) => ({ ...v, sale_price: e.target.value }))} /></div>
                </div>

                <div className="mb-4"><label className="form-label-title">Quantity</label><input type="number" min="0" step="1" className="form-control" value={form.quantity} onChange={(e) => setForm((v) => ({ ...v, quantity: e.target.value }))} /></div>
                <div className="mb-4"><label className="form-label-title">Description</label><textarea className="form-control" rows="4" value={form.description} onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))} placeholder="Product description" /></div>

                <div className="mb-4">
                  <div className="admin-product-image-heading">
                    <label className="form-label-title mb-0">Product Images</label>
                    <span>{totalSelectedImages}/{MAX_PRODUCT_IMAGES}</span>
                  </div>
                  <label className="admin-product-image-upload">
                    <RiImageAddLine />
                    <span>Add images</span>
                    <input key={fileInputKey} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={onImagesChange} />
                  </label>
                  <small className="text-muted d-block mt-2">Upload up to {MAX_PRODUCT_IMAGES} images. JPG, PNG, WEBP or GIF. Maximum 5 MB each.</small>

                  {form.existingImages.length || form.newImages.length ? (
                    <div className="admin-product-image-grid">
                      {form.existingImages.map((image) => {
                        const removed = form.removeImageIds.includes(image.id);
                        return (
                          <div key={image.id} className={`admin-product-image-item ${removed ? "is-removed" : ""}`}>
                            <img src={image.url} alt="Product" />
                            {removed ? (
                              <button type="button" className="restore-image" onClick={() => restoreExistingImage(image.id)}>Undo</button>
                            ) : (
                              <button type="button" className="remove-image" aria-label="Remove image" onClick={() => removeExistingImage(image.id)}><RiCloseLine /></button>
                            )}
                          </div>
                        );
                      })}
                      {form.newImages.map((image) => (
                        <div key={image.key} className="admin-product-image-item is-new">
                          <img src={image.preview} alt="New product" />
                          <span className="new-badge">New</span>
                          <button type="button" className="remove-image" aria-label="Remove image" onClick={() => removeNewImage(image.key)}><RiCloseLine /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-category-image-empty"><RiImageLine /><span>No images selected</span></div>
                  )}
                </div>

                <div className="mb-4 admin-status-line"><label className="form-label-title mb-0">Status</label><label className="switch"><input type="checkbox" checked={form.status} onChange={(e) => setForm((v) => ({ ...v, status: e.target.checked }))} /><span className="switch-state" /></label><span>{form.status ? "Active" : "Inactive"}</span></div>

                <div className="admin-form-buttons">
                  {form.uuid ? <button type="button" className="btn btn-light" onClick={resetForm}>Cancel</button> : null}
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : form.uuid ? "Update Product" : "Add Product"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
