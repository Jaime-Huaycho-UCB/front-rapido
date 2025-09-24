import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL; // 🔥 Global

type ProductType = {
    id: number;
    name: string;
};

type Product = {
    id: number;
    name: string;
    idType: number;
    costPrice: number;
    price: number;
    minStock: number;
    stock: number;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    type: ProductType;
};

export default function App() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<Partial<Product>>({});
    const [editingId, setEditingId] = useState<number | null>(null);

    // ✅ GET productos
    useEffect(() => {
        fetch(`${API_URL}/products`)
            .then((res) => res.json())
            .then((data) => {
                setProducts(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Función para armar el objeto limpio sin booleanos
    const buildProductPayload = (
        base: Partial<Product>,
        id?: number
    ): Omit<Product, "isActive" | "isDeleted"> => {
        return {
            id: id ?? Date.now(), // para mock o actualización
            name: base.name || "",
            idType: base.idType ?? 1, // default
            costPrice: base.costPrice ?? 0,
            price: base.price ?? 0,
            minStock: base.minStock ?? 0,
            stock: base.stock ?? 0,
            createdAt: base.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: base.type || { id: 1, name: "General" },
        };
    };

    // ✅ POST
    const handleAdd = async () => {
        const newProduct = buildProductPayload(form);

        await fetch(`${API_URL}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newProduct),
        });

        setProducts([...products, newProduct as Product]);
        setForm({});
    };

    // ✅ PUT
    const handleUpdate = async () => {
        if (!editingId) return;

        const updated = buildProductPayload(form, editingId);

        await fetch(`${API_URL}/products/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated),
        });

        setProducts(
            products.map((p) => (p.id === editingId ? (updated as Product) : p))
        );
        setForm({});
        setEditingId(null);
    };

    // ✅ DELETE
    const handleDelete = async (id: number) => {
        await fetch(`${API_URL}/products/${id}`, {
            method: "DELETE",
        });
        setProducts(products.filter((p) => p.id !== id));
    };

    if (loading)
        return <p className="text-center mt-10">Cargando productos...</p>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Gestión de Productos</h1>

            {/* Formulario */}
            <div className="mb-6 bg-gray-100 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">
                    {editingId ? "Editar Producto" : "Agregar Producto"}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        name="name"
                        placeholder="Nombre"
                        value={form.name || ""}
                        onChange={handleInputChange}
                        className="border p-2 rounded"
                    />
                    <input
                        type="number"
                        name="price"
                        placeholder="Precio"
                        value={form.price || ""}
                        onChange={handleInputChange}
                        className="border p-2 rounded"
                    />
                    <input
                        type="number"
                        name="stock"
                        placeholder="Stock"
                        value={form.stock || ""}
                        onChange={handleInputChange}
                        className="border p-2 rounded"
                    />
                </div>
                <button
                    onClick={editingId ? handleUpdate : handleAdd}
                    className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
                >
                    {editingId ? "Actualizar" : "Agregar"}
                </button>
            </div>

            {/* Lista */}
            {/* Lista */}
            <table className="w-full border border-gray-300 rounded-lg shadow text-sm">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-2 border">ID</th>
                        <th className="p-2 border">Nombre</th>
                        <th className="p-2 border">ID Tipo</th>
                        <th className="p-2 border">Tipo</th>
                        <th className="p-2 border">Costo</th>
                        <th className="p-2 border">Precio</th>
                        <th className="p-2 border">Stock Mínimo</th>
                        <th className="p-2 border">Stock</th>
                        <th className="p-2 border">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => (
                        <tr key={p.id} className="text-center">
                            <td className="p-2 border">{p.id}</td>
                            <td className="p-2 border">{p.name}</td>
                            <td className="p-2 border">{p.idType}</td>
                            <td className="p-2 border">{p.type?.name}</td>
                            <td className="p-2 border">${p.costPrice}</td>
                            <td className="p-2 border">${p.price}</td>
                            <td className="p-2 border">{p.minStock}</td>
                            <td className="p-2 border">{p.stock}</td>
                            <td className="p-2 border space-x-2">
                                <button
                                    onClick={() => {
                                        setForm(p);
                                        setEditingId(p.id);
                                    }}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(p.id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded"
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
