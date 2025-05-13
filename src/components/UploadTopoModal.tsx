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

  export default function UploadTopoModal({sessionToken, selectedCrag, selectedArea, refresh}:{sessionToken: string; selectedCrag: string; selectedArea: string; refresh: () => void}) {
    
    const form= useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        title: "unknown topo",
        description: "",
        image: undefined,
      },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
     // sending one request with the image to our cloudflare worker /api, proxied through vite for dev
     // and one to the backend to add to the database. TODO implement rollback in case one of the 2 fails
     const {title, description, image} = values;
     let imageName = "";

     const formData = new FormData();
     formData.append("image", image);

     try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: formData,
      });
      const data = await response.json();
      imageName = data.fileName;
      console.log("Image uploaded:", data);
     } catch (error) {
      console.error("Error uploading image:");
     }

     try {
      const response = await fetch(`https://sinai-backend.onrender.com/walltopos/${selectedArea}/${selectedCrag}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({title: title, description: description, name: imageName}),
      });
      const data = await response.json();
      console.log("Topo added:", data);
     } catch (error) {
      console.error("Error adding topo to database:");
     } finally {
      form.reset();
      refresh();
     }
    };

    return(
        <Dialog>
        <DialogTrigger asChild><Button className="bg-green-400">Add Topo</Button></DialogTrigger>
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