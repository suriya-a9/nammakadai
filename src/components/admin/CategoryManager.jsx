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
  const [formOpen, setFormOpen] = useState(false);

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
    setFormOpen(true);
  };

  const addSubcategory = (category) => {
    setMessage("");
    setError("");
    resetForm(category.uuid || category.id);
    setFormOpen(true);
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
      setFormOpen(false);
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

  const flatRows = visibleCategories.flatMap((category) => [
    { ...category, isChild: false, parentName: "—" },
    ...(category.subcategories || []).map((sub) => ({ ...sub, isChild: true, parentName: category.name })),
  ]);

  return (
    <div className="card-spacing">
      {(message || error) && <div className={`alert ${error ? "alert-danger" : "alert-success"} mb-4`}>{error || message}</div>}
      <div className="card">
        <div className="card-body">
          <div className="title-header option-title admin-product-title-row">
            <div><h5>Categories</h5><small>Manage categories and subcategories</small></div>
            <button className="btn btn-primary btn-sm" type="button" onClick={() => { resetForm(); setFormOpen(true); }}><RiAddLine /> Add Category</button>
          </div>
          <div className="mb-3"><input className="form-control" placeholder="Search categories" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          {loading ? <div className="admin-content-loading">Loading categories...</div> : flatRows.length ? (
            <div className="table-responsive"><table className="table all-package theme-table align-middle admin-list-table">
              <thead><tr><th>Category</th><th>Type</th><th>Parent</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{flatRows.map((category) => { const uuid=category.uuid||category.id; const active=isActive(category); const imageUrl=category.image_url||category.category_image?.original_url; return (
                <tr key={uuid}>
                  <td><div className="admin-product-cell">{imageUrl?<img src={imageUrl} alt={category.name}/>:<span className="admin-category-thumb admin-category-thumb-empty"><RiImageLine/></span>}<button type="button" className="admin-category-product-link fw-medium" onClick={()=>router.push(`/admin/product?category=${uuid}`)}>{category.name}</button></div></td>
                  <td>{category.isChild ? <span className="badge bg-light text-dark">Subcategory</span> : <span className="badge bg-light text-dark">Main</span>}</td>
                  <td>{category.parentName}</td><td><span className={`badge ${active?"badge-success":"badge-danger"}`}>{active?"Active":"Inactive"}</span></td>
                  <td><div className="admin-product-actions">{!category.isChild&&<button title="Add subcategory" onClick={()=>addSubcategory(category)}><RiAddLine/></button>}<button title="Edit" onClick={()=>editCategory(category)}><RiEdit2Line/></button><button className="delete" title="Delete" onClick={()=>removeCategory(category)}><RiDeleteBinLine/></button></div></td>
                </tr>);})}</tbody>
            </table></div>
          ) : <div className="admin-empty-category"><RiFolderLine/><div>No categories found</div></div>}
        </div>
      </div>

      <div className={`admin-offcanvas-backdrop ${formOpen ? "show" : ""}`} onClick={()=>setFormOpen(false)} />
      <aside className={`admin-offcanvas ${formOpen ? "show" : ""}`} aria-hidden={!formOpen}>
        <div className="admin-offcanvas-header"><div><small>Category management</small><h5>{form.uuid ? (form.parent_uuid?"Edit Subcategory":"Edit Category") : (form.parent_uuid?"Add Subcategory":"Add Category")}</h5></div><button type="button" onClick={()=>setFormOpen(false)}>×</button></div>
        <div className="admin-offcanvas-body">
          <form className="theme-form theme-form-2 mega-form" onSubmit={save}>
            <div className="mb-4"><label className="form-label-title">Name <span className="text-danger">*</span></label><input className="form-control" value={form.name} onChange={(e)=>setForm(v=>({...v,name:e.target.value}))} required /></div>
            <div className="mb-4"><label className="form-label-title">Parent Category</label><select className="form-select" value={form.parent_uuid} disabled={hasChildren} onChange={(e)=>setForm(v=>({...v,parent_uuid:e.target.value}))}><option value="">None - Main Category</option>{categories.filter(c=>(c.uuid||c.id)!==form.uuid).map(c=><option key={c.uuid||c.id} value={c.uuid||c.id}>{c.name}</option>)}</select>{hasChildren&&<p className="help-text mt-2">A category with subcategories must remain a main category.</p>}</div>
            <div className="mb-4"><label className="form-label-title">Image</label><input key={fileInputKey} className="form-control" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onImageChange}/>{form.imagePreview?<div className="admin-category-image-preview"><img src={form.imagePreview} alt="Category preview"/><button type="button" className="btn btn-sm btn-outline-danger" onClick={removeSelectedImage}>Remove</button></div>:<div className="admin-category-image-empty"><RiImageLine/><span>No image selected</span></div>}</div>
            <div className="mb-4 admin-status-line"><label className="form-label-title mb-0">Status</label><label className="switch"><input type="checkbox" checked={form.status} onChange={(e)=>setForm(v=>({...v,status:e.target.checked}))}/><span className="switch-state"/></label><span>{form.status?"Active":"Inactive"}</span></div>
            <div className="admin-form-buttons"><button type="button" className="btn btn-light" onClick={()=>setFormOpen(false)}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving?"Saving...":form.uuid?"Update Category":"Save Category"}</button></div>
          </form>
        </div>
      </aside>
    </div>
  );
}
