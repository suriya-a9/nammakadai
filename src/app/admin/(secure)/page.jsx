import Link from "next/link";
import prisma from "@/lib/prisma";
import { RiFolderLine, RiCheckboxCircleLine, RiShoppingBag3Line } from "react-icons/ri";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalCategories, activeCategories, totalProducts] = await Promise.all([
    prisma.category.count(),
    prisma.category.count({ where: { status: true } }),
    prisma.product.count(),
  ]);

  return (
    <>
      <section className="dashboard-tiles">
        <div className="container-fluid p-0">
          <div className="row g-sm-4 g-3">
            <div className="col-md-5 welcome-tiles admin-dashboard-welcome">
              <div className="card m-0 position-relative">
                <img src="/admin-assets/images/bg.jpg" className="img-fluid" alt="Dashboard" />
                <div className="card-body">
                  <h2>Welcome Back Admin</h2>
                  <p>Manage your NammaKadai categories, products and storefront data from one place.</p>
                </div>
              </div>
            </div>
            <div className="col-md-7">
              <div className="row g-sm-4 g-3 h-100">
                <div className="col-sm-4 widget-card-box">
                  <Link href="/admin/category" className="widget-card card mb-0 admin-metric-card h-100">
                    <div className="widget-icon"><RiFolderLine /></div>
                    <div><h6>Total Categories</h6><h2>{totalCategories}</h2></div>
                  </Link>
                </div>
                <div className="col-sm-4 widget-card-box">
                  <Link href="/admin/category" className="widget-card card mb-0 admin-metric-card h-100">
                    <div className="widget-icon"><RiCheckboxCircleLine /></div>
                    <div><h6>Active Categories</h6><h2>{activeCategories}</h2></div>
                  </Link>
                </div>
                <div className="col-sm-4 widget-card-box">
                  <Link href="/admin/product" className="widget-card card mb-0 admin-metric-card h-100">
                    <div className="widget-icon"><RiShoppingBag3Line /></div>
                    <div><h6>Total Products</h6><h2>{totalProducts}</h2></div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="card-bottom-space mt-4">
        <div className="card">
          <div className="card-body">
            <div className="title-header option-title"><h5>Quick Access</h5></div>
            <p className="mb-3">Create and manage products or organize your storefront categories.</p>
            <div className="d-flex gap-2 flex-wrap">
              <Link href="/admin/product" className="btn btn-primary">Manage Products</Link>
              <Link href="/admin/category" className="btn btn-outline-primary">Manage Categories</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
