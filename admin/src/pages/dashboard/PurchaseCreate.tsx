import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Search, Plus, Trash2, Save, ShoppingCart } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

type Product = {
  _id: string;
  name: string;
  purchasePrice: number;
  price: number;
  profitMargin: number;
};

type Supplier = {
  _id: string;
  name: string;
};

export default function PurchaseCreate() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axiosPrivate.get("/suppliers", { params: { limit: 100 } });
      setSuppliers(response.data.data);
    } catch (error) {}
  };

  const fetchProducts = async () => {
    try {
      const response = await axiosPrivate.get("/products", { params: { limit: 1000 } });
      setProducts(response.data.products);
    } catch (error) {}
  };

  const addItem = (productId: string) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    if (items.some(item => item.productId === productId)) {
      toast({ title: "Already added", description: "Product is already in the list" });
      return;
    }

    setItems([...items, {
      productId: product._id,
      productName: product.name,
      quantity: 1,
      purchasePrice: product.purchasePrice || 0,
      profitMargin: product.profitMargin || 0,
      sellingPrice: product.price || 0,
      totalCost: product.purchasePrice || 0
    }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    item[field] = value;

    if (field === "quantity" || field === "purchasePrice") {
      item.totalCost = item.quantity * item.purchasePrice;
    }

    if (field === "purchasePrice" || field === "profitMargin") {
      // Calculate selling price: cost + (cost * margin / 100)
      item.sellingPrice = item.purchasePrice + (item.purchasePrice * item.profitMargin / 100);
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.totalCost, 0);
  };

  const handleSave = async () => {
    if (!selectedSupplier) {
      toast({ title: "Error", description: "Please select a supplier", variant: "destructive" });
      return;
    }
    if (items.length === 0) {
      toast({ title: "Error", description: "Please add at least one item", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const supplierData = suppliers.find(s => s._id === selectedSupplier);
      await axiosPrivate.post("/purchases", {
        supplier: {
          supplierId: selectedSupplier,
          name: supplierData?.name
        },
        items,
        notes
      });
      toast({ title: "Success", description: "Purchase requisition created successfully" });
      navigate("/dashboard/purchases");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create purchase",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Create Purchase</h1>
          <p className="text-gray-500">Create a new purchase requisition</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
          <Save className="mr-2 h-4 w-4" /> {loading ? "Saving..." : "Save Requisition"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Purchase Items
            </h2>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[30%]">Product</TableHead>
                    <TableHead className="w-[15%]">Qty</TableHead>
                    <TableHead className="w-[15%]">Unit Cost</TableHead>
                    <TableHead className="w-[10%]">Margin %</TableHead>
                    <TableHead className="w-[15%]">Sale Price</TableHead>
                    <TableHead className="w-[10%] text-right">Total</TableHead>
                    <TableHead className="w-[5%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-sm truncate max-w-[150px]">{item.productName}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={item.purchasePrice}
                          onChange={(e) => updateItem(index, "purchasePrice", parseFloat(e.target.value))}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={item.profitMargin}
                          onChange={(e) => updateItem(index, "profitMargin", parseFloat(e.target.value))}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={item.sellingPrice}
                          readOnly
                          className="h-8 bg-gray-50"
                        />
                      </TableCell>
                      <TableCell className="text-right font-semibold">${item.totalCost.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-red-500 hover:bg-red-50 h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-gray-400">No items added yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end text-xl font-bold">
              Total: ${calculateTotal().toFixed(2)}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
            <h2 className="text-xl font-semibold">Additional Information</h2>
            <div className="space-y-2">
              <Label>Notes</Label>
              <textarea
                className="w-full min-h-[100px] p-3 border rounded-md focus:ring-1 focus:ring-primary outline-none"
                placeholder="Enter any additional notes or instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
            <h2 className="text-xl font-semibold">Selection</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Supplier</Label>
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => (
                      <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 pt-2 border-t">
                <Label>Add Products</Label>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {products.map(p => (
                    <div key={p._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md border text-sm">
                      <span className="truncate flex-1 pr-2">{p.name}</span>
                      <Button variant="outline" size="sm" onClick={() => addItem(p._id)} className="h-7 px-2">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
