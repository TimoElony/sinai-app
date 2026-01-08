import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/src/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/src/components/ui/form";
import { Button } from "@/src/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/src/components/ui/textarea";
import { Input } from "@/src/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

const formSchema = z.object({
    name: z.string().min(2).max(50),
    grade: z.string().min(2).max(20),
    length: z.number().min(0).max(100),
    bolts: z.number().min(0).max(100),
    info: z.string().min(2).max(200),
    area: z.string().min(2).max(290),
    crag: z.string().min(2).max(200),
    setters: z.string().min(2).max(200),
    fa_year: z.number().min(1900).max(2100),
    fa_month: z.number().min(1).max(12),
    fa_day: z.number().min(0).max(31).optional(),
});


export default function CreateRouteModal({sessionToken, selectedCrag, selectedArea, refresh, setLoading, setProgress}:{sessionToken: string; selectedCrag: string; selectedArea: string, refresh: () => void; setLoading: (arg: boolean)=> void; setProgress: (arg: number)=>void}) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            grade: "",
            length: 0,
            bolts: 0,
            info: "",
            area: selectedArea,
            crag: selectedCrag,
            setters: "",
            fa_year: new Date().getFullYear(),
            fa_month: new Date().getMonth() + 1,
            fa_day: 0,
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        setIsOpen(false);
        setProgress(50);
        toast("submitting...:"+values.name);
        const {name, grade, length, bolts, info, area, crag, setters, fa_year, fa_month, fa_day} = values;

        try {
            const response = await fetch('/api/climbingroutes/new', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionToken}`,
                    },
                    body: JSON.stringify({
                        name,
                        grade,
                        length,
                        bolts,
                        info,
                        area,
                        crag,
                        setters,
                        fa_year,
                        fa_month,
                        fa_day: fa_day || null,
                    }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create route');
            }
            
            const data = await response.json();
            toast.success("Route added: " + data.message);
            form.reset(); // Reset form after successful submission
        } catch (error) {
            toast.error("Error adding route: " + String(error));
        } finally {
            setProgress(100);
            await refresh();
            setLoading(false);
        }
    };

    return( 
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild><Button>Add route to this crag</Button></DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                <DialogTitle>Create new route</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Route Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Route Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="grade"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Route Grade</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Route Grade" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="length"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Route Length</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Route Length" {...field} onChange={(e)=>field.onChange(Number(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bolts"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Route Bolts</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Route Bolts" {...field} onChange={(e)=>field.onChange(Number(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="info"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Route Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Route Description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="setters"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Route Setters</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Setters" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="fa_year"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Ascent Year *</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Year" {...field} onChange={(e)=>field.onChange(Number(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="fa_month"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Ascent Month *</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Month (1-12)" {...field} onChange={(e)=>field.onChange(Number(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="fa_day"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Ascent Day (optional)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Day (1-31, leave 0 if unknown)" {...field} onChange={(e)=>field.onChange(Number(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="area"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Area</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="crag"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Crag</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Add Route</Button>
                    </form>
                </Form>
                <DialogDescription>
                    click to submit this route permanently
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
}