import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
    name: z.string().min(2).max(20),
    grade: z.string().min(2).max(20),
    length: z.number().min(0).max(100),
    bolts: z.number().min(0).max(100),
    info: z.string().min(2).max(200),
    area: z.string().min(2).max(20),
    crag: z.string().min(2).max(20),
    setters: z.string().min(2).max(20),
});


export default function CreateRouteModal({sessionToken, selectedCrag, selectedArea, refresh, setLoading, setProgress}:{sessionToken: string; selectedCrag: string; selectedArea: string, refresh: () => void; setLoading: (arg: boolean)=> void; setProgress: (arg: number)=>void}) {
    
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
            setters: ""
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        setProgress(50);
        console.log("Form submitted:", values);
        const {name, grade, length, bolts, info, area, crag, setters} = values;

        try {
            const response = await fetch('https://sinai-backend.onrender.com/climbingroutes/new', {
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
                    }),
            });
            const data = await response.json();
            console.log("Route added:", data);
        } catch (error) {
            console.error("Error adding route:", error);
        } finally {
            setProgress(100)
            refresh();
            setLoading(false);
        }
    };

    return( 
        <Dialog>
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