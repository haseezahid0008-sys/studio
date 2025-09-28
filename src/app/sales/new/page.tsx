
"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2, Loader2, Camera, UserPlus } from "lucide-react"
import { getProducts, getSalesmen, addSale, getUser, getCustomersBySalesman, addCustomer, getAppSettings, getCurrencySymbol } from "@/lib/firestore"
import type { Product, AppUser, Customer, AppSettings } from "@/lib/types"
import PageHeader from "@/components/page-header"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

type SaleItem = {
  productId: string
  quantity: number
  unitPrice: number
  total: number
}

const CLOUDINARY_CLOUD_NAME = 'dlurl7eyy';
const CLOUDINARY_UPLOAD_PRESET = 'image-host';


function CameraModal({ onCapture }: { onCapture: (file: File) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const openCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsCameraOpen(true);
        } catch (error) {
            console.error("Error accessing camera:", error);
            alert("Could not access the camera. Please check permissions.");
        }
    };

    const closeCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        setIsCameraOpen(false);
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    onCapture(file);
                    closeCamera();
                }
            }, 'image/jpeg');
        }
    };
    
    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            if (stream) {
                 stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    return (
        <Dialog onOpenChange={(open) => !open && closeCamera()}>
            <DialogTrigger asChild>
                <Button variant="outline" type="button" onClick={openCamera}>
                    <Camera className="mr-2"/> Capture Shop Photo
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Live Camera Capture</DialogTitle>
                </DialogHeader>
                <div className="relative">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-md bg-black" />
                    <canvas ref={canvasRef} className="hidden" />
                </div>
                <DialogFooter>
                     <DialogClose asChild>
                        <Button variant="outline" onClick={closeCamera}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleCapture} disabled={!isCameraOpen}>Capture</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function AddCustomerModal({ salesmanId, onCustomerAdded }: { salesmanId: string, onCustomerAdded: (newCustomer: Customer) => void }) {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleAddCustomer = async () => {
        if (!name || !phone) {
            toast({ title: "Error", description: "Name and phone are required.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            const newCustomerData = { name, phone, address, salesmanId, totalDue: 0 };
            const customerRef = await addCustomer(newCustomerData);
            onCustomerAdded({ ...newCustomerData, id: customerRef.id });
            toast({ title: "Success", description: "New customer added." });
            setIsOpen(false);
            setName('');
            setPhone('');
            setAddress('');
        } catch (error) {
            console.error("Failed to add customer:", error);
            toast({ title: "Error", description: "Failed to add new customer.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <UserPlus className="mr-2 h-4 w-4" /> Add New Customer
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="new-customer-name">Customer Name</Label>
                        <Input id="new-customer-name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="new-customer-phone">Phone Number</Label>
                        <Input id="new-customer-phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isSaving} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="new-customer-address">Address (Optional)</Label>
                        <Input id="new-customer-address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={isSaving} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleAddCustomer} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Customer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function NewSalePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [salesmen, setSalesmen] = useState<AppUser[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [salesmanId, setSalesmanId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [shopImageFile, setShopImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [items, setItems] = useState<SaleItem[]>([
    { productId: "", quantity: 1, unitPrice: 0, total: 0 },
  ])
  const [discount, setDiscount] = useState(0)
  const [amountPaid, setAmountPaid] = useState(0)

  const [subtotal, setSubtotal] = useState(0)
  const [total, setTotal] = useState(0)
  const [pendingAmount, setPendingAmount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const [productsData, salesmenData, currentUserData, appSettings] = await Promise.all([
          getProducts(),
          getSalesmen(),
          getUser(user.uid),
          getAppSettings(),
        ]);
        setProducts(productsData);
        setSalesmen(salesmenData);
        setAppUser(currentUserData);
        setSettings(appSettings);
        
        let targetSalesmanId = salesmanId;
        if (currentUserData?.role === 'Salesman') {
          targetSalesmanId = user.uid;
          setSalesmanId(user.uid);
        }
        
        if (targetSalesmanId) {
          const customerData = await getCustomersBySalesman(targetSalesmanId);
          setCustomers(customerData);
        }

      } catch (err) {
        setError("Failed to load necessary data. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user, salesmanId])

  useEffect(() => {
    const newSubtotal = items.reduce((acc, item) => acc + item.total, 0)
    setSubtotal(newSubtotal)
  }, [items])

  useEffect(() => {
    const newTotal = subtotal - discount
    setTotal(newTotal)
  }, [subtotal, discount])

  useEffect(() => {
    const newPending = total - amountPaid
    setPendingAmount(newPending)
  }, [total, amountPaid])

  const handleCapture = (file: File) => {
      setShopImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
          setImagePreview(reader.result as string);
      }
      reader.readAsDataURL(file);
  }

  const handleItemChange = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...items]
    const currentItem = { ...newItems[index] }

    if (field === "productId") {
      const product = products.find((p) => p.id === value)
      currentItem.productId = value
      currentItem.unitPrice = product?.salePrice || 0
    } else {
      (currentItem[field] as any) = value
    }

    currentItem.total = currentItem.quantity * currentItem.unitPrice
    newItems[index] = currentItem
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1, unitPrice: 0, total: 0 }])
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Cloudinary upload failed:", errorData);
        throw new Error('Image upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  };


  const handleSubmit = async () => {
      if (!salesmanId || !customerId || items.some(i => !i.productId) || !shopImageFile) {
          setError("Please select a salesman, a customer, add items and capture the shop photo.");
          return;
      }
      setIsSaving(true);
      setError(null);
      
      let shopImageURL: string | undefined = undefined;
      try {
          if (shopImageFile) {
              shopImageURL = await uploadToCloudinary(shopImageFile);
          }

          const customer = customers.find(c => c.id === customerId);
          if (!customer) throw new Error("Customer not found");

          const saleData = {
              date: saleDate,
              customerId: customerId,
              customerName: customer.name,
              items: items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
              discount,
              total,
              amountPaid,
              shopImageURL,
          };

          if(!salesmanId) throw new Error("Salesman not selected");
          await addSale(saleData, salesmanId);
          toast({
              title: "Success",
              description: "Sale recorded successfully.",
          });
          router.push('/sales');

      } catch (e) {
          console.error("Failed to add sale: ", e);
          setError("Failed to record sale. Please try again.");
          setIsSaving(false);
      }
  };
  
  const handleCustomerAdded = (newCustomer: Customer) => {
    setCustomers(prev => [...prev, newCustomer]);
    setCustomerId(newCustomer.id);
  }

  if (isLoading && !salesmanId) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
        </div>
    )
  }
  
  const currencySymbol = getCurrencySymbol(settings?.currency);

  return (
    <>
      <PageHeader
        title="Create New Sale"
        description="Fill out the form to record a new sale."
        showBackButton
      />
      <div className="grid gap-4 md:grid-cols-[1fr_350px]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Sale & Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
               <div className="grid md:grid-cols-2 gap-4">
                 <div className="grid gap-2">
                    <Label htmlFor="date">Sale Date</Label>
                    <Input id="date" type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} disabled={isSaving}/>
                  </div>
                {appUser?.role !== 'Salesman' && (
                  <div className="grid gap-2">
                    <Label htmlFor="salesman">Salesman</Label>
                    <Select value={salesmanId} onValueChange={setSalesmanId} disabled={isSaving}>
                      <SelectTrigger id="salesman">
                        <SelectValue placeholder="Select salesman" />
                      </SelectTrigger>
                      <SelectContent>
                        {salesmen.map((s) => (
                          <SelectItem key={s.uid} value={s.uid}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
               </div>
              <div className="grid gap-2">
                <Label htmlFor="customer">Customer</Label>
                <div className="flex gap-2">
                    <Select value={customerId} onValueChange={setCustomerId} disabled={isSaving || !salesmanId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an existing customer" />
                        </SelectTrigger>
                        <SelectContent>
                             {customers.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.name} - {c.phone}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {salesmanId && <AddCustomerModal salesmanId={salesmanId} onCustomerAdded={handleCustomerAdded} />}
                </div>
                {!salesmanId && <p className="text-xs text-muted-foreground">Please select a salesman to see customers.</p>}
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="shop-image">Shop Photo (Required)</Label>
                  <CameraModal onCapture={handleCapture} />
                  {imagePreview && (
                    <div className="mt-2">
                      <Image src={imagePreview} alt="Shop preview" width={100} height={100} className="rounded-md object-cover"/>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Products</CardTitle>
              <CardDescription>Add products to the sale.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-[1fr_100px_120px_auto] items-end gap-2">
                  <div className="grid gap-1">
                    {index === 0 && <Label>Product</Label>}
                    <Select
                      value={item.productId}
                      onValueChange={(value) => handleItemChange(index, "productId", value)}
                      disabled={isSaving}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1">
                    {index === 0 && <Label>Quantity</Label>}
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                       disabled={isSaving}
                    />
                  </div>
                  <div className="grid gap-1">
                    {index === 0 && <Label>Unit Price</Label>}
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                       disabled={isSaving}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1 || isSaving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addItem} disabled={isSaving}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discount">Discount</Label>
                <Input id="discount" type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} disabled={isSaving}/>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{currencySymbol}{total.toFixed(2)}</span>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount-paid">Amount Paid</Label>
                <Input id="amount-paid" type="number" value={amountPaid} onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)} disabled={isSaving} />
              </div>
              <div className="flex justify-between text-destructive font-bold text-lg">
                <span>Pending Amount</span>
                <span>{currencySymbol}{pendingAmount.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.back()} disabled={isSaving}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Sale
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  )
}
