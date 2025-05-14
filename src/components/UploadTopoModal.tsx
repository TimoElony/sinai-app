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
  longitude: z.number().min(24).max(37),
  latitude: z.number().min(22).max(32),
  image: z.instanceof(File).refine((file) => file.size <= 2 * 1024 * 1024, {
    message: "File size should be less than 2MB",
  }),
});

  export default function UploadTopoModal({sessionToken, selectedCrag, selectedArea, refresh, setLoading, setProgress}:{sessionToken: string; selectedCrag: string; selectedArea: string; refresh: () => void; setLoading: (arg: boolean) => void; setProgress: (arg: number)=> void}) {
    
    const form= useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        title: "unknown topo",
        description: "",
        longitude: 34,
        latitude: 27.8,
        image: undefined,
      },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
     // sending one request with the image to our cloudflare worker /api, proxied through vite for dev
     // and one to the backend to add to the database. TODO implement rollback in case one of the 2 fails
     setLoading(true);
     setProgress(50);
     const {image} = values;
     let imageName = "";

     const formData = new FormData();
     formData.append("image", image);

     try {
      const response = await fetch('https://curly-king-5594.timo-elony.workers.dev', {
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
     } finally {
      setProgress(80)
     }

     try {
      const response = await fetch(`https://sinai-backend.onrender.com/walltopos/${selectedArea}/${selectedCrag}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({...values, image: undefined, name: imageName}),
      });
      const data = await response.json();
      console.log("Topo added:", data);
     } catch (error) {
      console.error("Error adding topo to database:");
     } finally {
      setProgress(100);
      setLoading(false);
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
                        <Input {...field} />
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
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude (33-34.7 roughly)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude (27.7-29 roughly)</FormLabel>
                      <FormControl>
                        <Input {...field} />
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