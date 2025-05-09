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
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
  import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Textarea } from "./ui/textarea";
 
const formSchema = z.object({
  title: z.string().min(2).max(20),
  description: z.string().min(2).max(200),
  image: z.instanceof(File).refine((file) => file.size <= 2 * 1024 * 1024, {
    message: "File size should be less than 2MB",
  }),
});

  export default function UploadTopoModal({sessionToken, selectedCrag, selectedArea}:{sessionToken: string; selectedCrag: string; selectedArea: string}){
    
    const form= useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        title: "unknown topo",
        description: "",
        image: undefined,
      },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
     console.log("Form submitted:", values);
     const response = await fetch(`https://sinai-backend.onrender.com/walltopos/${selectedArea}/${selectedCrag}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`,
                },
                body: JSON.stringify(values),
            });
          const data = await response.json();
          console.log("Topo added:", data);
          form.reset();
    };

    return(
        <Dialog>
        <DialogTrigger asChild><Button className="bg-green-300">Add Topo</Button></DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Upload your topo</DialogTitle>
            <DialogDescription>
                Upload a topo image for {selectedCrag} in {selectedArea}
            </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" encType="multipart/form-data">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <Input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            field.onChange(e.target.files?.[0] ?? null);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="bg-green-300">Submit</Button>
              </form>
            </Form>
        </DialogContent>
        </Dialog>

            
    );
  }