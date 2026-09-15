"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RiAddLine, RiDeleteBinLine, RiEdit2Line, RiFolderLine, RiImageLine } from "react-icons/ri";

const EMPTY_FORM = {
  uuid: null,
  name: "",
  status: true,
  parent_uuid: "",
  image_url: "",
  imageFile: null,
  imagePreview: "",
  removeImage: false,
};

const isActive = (category) => Number(category.status) === 1 || category.status === true;

const filterCategoryTree = (categories, value) => {
  if (!value) return categories;
  return categories.reduce((result, category) => {
    const children = filterCategoryTree(category.subcategories || [], value);
    if (category.name?.toLowerCase().includes(value) || children.length) {
      result.push({ ...category, subcategories: children });
    }
    return result;
  }, []);
};

export default function CategoryManager() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/category?paginate=500", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to load categories");
      setCategories(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const visibleCategories = useMemo(() => {
    const value = search.trim().toLowerCase();
    return filterCategoryTree(categories, value);
  }, [categories, search]);

  const resetForm = (parentUuid = "") => {
    setForm({ ...EMPTY_FORM, parent_uuid: parentUuid });
    setFileInputKey((value) => value + 1);
  };

  const findCategory = (uuid) => {
    for (const category of categories) {
      if ((category.uuid || category.id) === uuid) return category;
      const child = (category.subcategories || []).find((item) => (item.uuid || item.id) === uuid);
      if (child) return child;
    }
    return null;
  };

  const editCategory = (category) => {
    setMessage("");
    setError("");
    const imageUrl = category.image_url || category.category_image?.original_url || "";
    setForm({
      uuid: category.uuid || category.id,
      name: category.name || "",
      status: isActive(category),
      parent_uuid: category.parent_uuid || category.parent_id || "",
      image_url: imageUrl,
      imageFile: null,
      imagePreview: imageUrl,
      removeImage: false,
    });
    setFileInputKey((value) => value + 1);
  };

  const addSubcategory = (category) => {
    setMessage("");
    setError("");
    resetForm(category.uuid || category.id);
  };

  const onImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Category image must be 5 MB or smaller");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((value) => ({
        ...value,
        imageFile: file,
        imagePreview: reader.result,
        removeImage: false,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    setForm((value) => ({
      ...value,
      imageFile: null,
      imagePreview: "",
      removeImage: Boolean(value.image_url),
    }));
    setFileInputKey((value) => value + 1);
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
      payload.append("status", form.status ? "1" : "0");
      payload.append("parent_uuid", form.parent_uuid || "");
      if (form.imageFile) payload.append("image", form.imageFile);
      if (form.removeImage) payload.append("remove_image", "1");

      const response = await fetch(editing ? `/api/category/${form.uuid}` : "/api/category", {
        method: editing ? "PATCH" : "POST",
        body: payload,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to save category");

      const isSubcategory = Boolean(form.parent_uuid);
      setMessage(
        editing
          ? "Category updated successfully"
          : isSubcategory
            ? "Subcategory created successfully"
            : "Category created successfully"
      );
      resetForm();
      await loadCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (category) => {
    const uuid = category.uuid || category.id;
    const childCount = category.subcategories?.length || 0;
    const warning = childCount
      ? `Delete ${category.name} and its ${childCount} subcategor${childCount === 1 ? "y" : "ies"}?`
      : `Delete ${category.name}?`;
    if (!window.confirm(warning)) return;

    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/category/${uuid}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to delete category");
      if (form.uuid === uuid || form.parent_uuid === uuid) resetForm();
      setMessage("Category deleted successfully");
      await loadCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const currentCategory = form.uuid ? findCategory(form.uuid) : null;
  const hasChildren = Boolean(currentCategory?.subcategories?.length);

  const renderRow = (category, isChild = false) => {
    const active = isActive(category);
    const uuid = category.uuid || category.id;
    const imageUrl = category.image_url || category.category_image?.original_url;

    return (
      <li key={uuid} className={isChild ? "admin-subcategory-item" : ""}>
        <div className={`admin-category-row ${!active ? "disabled" : ""}`}>
          {imageUrl ? (
            <img className="admin-category-thumb" src={imageUrl} alt={category.name} />
          ) : (
            <span className="admin-category-thumb admin-category-thumb-empty"><RiImageLine /></span>
          )}
          <span className={`category-status-dot ${active ? "active" : ""}`} />
          <button type="button" className="admin-category-name admin-category-product-link" title={`View ${category.name} products`} onClick={() => router.push(`/admin/product?category=${uuid}`)}>{category.name}</button>
          <div className="admin-category-actions tree-options">
            {!isChild && (
              <button type="button" title="Add subcategory" onClick={() => addSubcategory(category)}>
                <RiAddLine />
              </button>
            )}
            <button type="button" title="Edit category" onClick={() => editCategory(category)}>
              <RiEdit2Line />
            </button>
            <button type="button" title="Delete category" className="delete" onClick={() => removeCategory(category)}>
              <RiDeleteBinLine />
            </button>
          </div>
        </div>
        {category.subcategories?.length ? (
          <ul className="admin-subcategory-list">
            {category.subcategories.map((subcategory) => renderRow(subcategory, true))}
          </ul>
        ) : null}
      </li>
    );
  };

  return (
    <div className="card-spacing">
      {(message || error) && (
        <div className={`alert ${error ? "alert-danger" : "alert-success"} mb-4`} role="alert">
          {error || message}
        </div>
      )}

      <div className="row">
        <div className="col-xl-4">
          <div className="card">
            <div className="card-body">
              <div className="title-header option-title">
                <h5>Categories</h5>
              </div>
              <div className="theme-tree-box">
                <input
                  className="form-control"
                  placeholder="Search Category"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {loading ? (
                  <div className="admin-content-loading">Loading categories...</div>
                ) : visibleCategories.length ? (
                  <ul className="tree-main-ul">
                    <li>
                      <div className="admin-tree-root-title">
                        <i className="tree-icon folder-icon cursor" role="presentation" />
                        Category
                      </div>
                      <ul className="child-tree-list mt-2">
                        {visibleCategories.map((category) => renderRow(category))}
                      </ul>
                    </li>
                  </ul>
                ) : (
                  <div className="admin-empty-category"><RiFolderLine /><div>No categories found</div></div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-8">
          <div className="card">
            <div className="card-body">
              <div className="title-header option-title">
                <h5>
                  {form.uuid
                    ? form.parent_uuid
                      ? "Edit Subcategory"
                      : "Edit Category"
                    : form.parent_uuid
                      ? "Add Subcategory"
                      : "Add Category"}
                </h5>
              </div>

              <form className="theme-form theme-form-2 mega-form" onSubmit={save}>
                <div className="row">
                  <div className="input-error">
                    <div className="mb-4 align-items-center row">
                      <div className="col-sm-3">
                        <label htmlFor="category-name" className="col-form-label form-label-title">
                          Name <span className="theme-color ms-2 required-dot">*</span>
                        </label>
                      </div>
                      <div className="col-sm-9">
                        <input
                          id="category-name"
                          className="form-control"
                          type="text"
                          placeholder="Enter Category Name"
                          value={form.name}
                          onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="input-error">
                    <div className="mb-4 align-items-center row">
                      <div className="col-sm-3">
                        <label htmlFor="parent-category" className="col-form-label form-label-title">Parent Category</label>
                      </div>
                      <div className="col-sm-9">
                        <select
                          id="parent-category"
                          className="form-control form-select"
                          value={form.parent_uuid}
                          disabled={hasChildren}
                          onChange={(event) => setForm((value) => ({ ...value, parent_uuid: event.target.value }))}
                        >
                          <option value="">None - Main Category</option>
                          {categories
                            .filter((category) => (category.uuid || category.id) !== form.uuid)
                            .map((category) => (
                              <option key={category.uuid || category.id} value={category.uuid || category.id}>
                                {category.name}
                              </option>
                            ))}
                        </select>
                        {hasChildren && <p className="help-text mt-2 mb-0">A category with subcategories must remain a main category.</p>}
                      </div>
                    </div>
                  </div>

                  <div className="input-error">
                    <div className="mb-4 align-items-start row">
                      <div className="col-sm-3">
                        <label htmlFor="category-image" className="col-form-label form-label-title">Image</label>
                      </div>
                      <div className="col-sm-9">
                        <input
                          key={fileInputKey}
                          id="category-image"
                          className="form-control"
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={onImageChange}
                        />
                        <p className="help-text mt-2 mb-0">JPG, PNG, WEBP or GIF. Maximum 5 MB.</p>

                        {form.imagePreview ? (
                          <div className="admin-category-image-preview">
                            <img src={form.imagePreview} alt="Category preview" />
                            <button type="button" className="btn btn-sm btn-outline-danger" onClick={removeSelectedImage}>
                              Remove image
                            </button>
                          </div>
                        ) : (
                          <div className="admin-category-image-empty"><RiImageLine /><span>No image selected</span></div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="input-error">
                    <div className="mb-4 align-items-center row">
                      <div className="col-sm-3">
                        <label className="col-form-label form-label-title">Status</label>
                      </div>
                      <div className="col-sm-9">
                        <div className="form-switch custom-switch-flex form-check ps-0">
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={form.status}
                              onChange={(event) => setForm((value) => ({ ...value, status: event.target.checked }))}
                            />
                            <span className="switch-state" />
                          </label>
                          <p className="help-text mb-0">{form.status ? "Active" : "Inactive"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {form.uuid && (
                    <div className="input-error">
                      <div className="mb-4 align-items-center row">
                        <div className="col-sm-3"><label className="col-form-label form-label-title">UUID</label></div>
                        <div className="col-sm-9"><input className="form-control" value={form.uuid} readOnly /></div>
                      </div>
                    </div>
                  )}

                  <div className="admin-form-buttons">
                    {(form.uuid || form.parent_uuid) && (
                      <button className="btn btn-outline-secondary" type="button" onClick={() => resetForm()}>
                        Cancel
                      </button>
                    )}
                    <button className="btn btn-primary" type="submit" disabled={saving}>
                      {saving ? "Saving..." : form.uuid ? "Update" : "Save"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
