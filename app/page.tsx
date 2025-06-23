import { apiClient } from "@/lib/api-client";
import { IProduct } from "@/models/Product";
import { useEffect, useState } from "react";

export default function Home() {
  const [product, setProduct] = useState<IProduct[]>([]);

  useEffect(() => {
    getProducts();
  }, []);

  async function getProducts() {
    try {
      const res = await apiClient.getProducts();
      setProduct(res);
    } catch (error) {
      
    }
  }
  return <div>Home</div>;
}
