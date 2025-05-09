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
  FormDescription,
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
 
const formSchema = z.object({
  title: z.string().min(2).max(20),
  description: z.string().min(2).max(200),
  image: z.instanceof(File).refine((file) => file.size <= 2 * 1024 * 1024, {
    message: "File size should be less than 2MB",
  }),
});

type FormData = z.infer<typeof formSchema>;

  export default function UploadTopoModal({sessionToken, selectedCrag, selectedArea}:{sessionToken: string; selectedCrag: string; selectedArea: string}){
    
    const { register , handleSubmit, formState:{ errors } }= useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        title: "unknown topo",
        description: "",
        image: new File([], "no file"),
      },
    });

    const onSubmit = async (data: FormData) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("image", data.image);
      formData.append("area", selectedArea);
      formData.append("crag", selectedCrag);
      try {
        const response = await fetch('https://sinai-backend.onrender.com/topos/new', {
          method: 'POST',
          headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`,
                },
          body: formData,
        });
        const data = await response.json();
        console.log("Topo added:", data);
      } catch (error) {
        console.error("Error adding topo:", error);
      }
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <input className="bg-gray-200"{...register("title")}/>
                <p>{errors.title?.message}</p>
                <input className="bg-gray-200"{...register("description")}/>
                <p>{errors.description?.message}</p>
                <input className="bg-gray-200"{...register("image")} type="file" accept="image/*" />
                <p>{errors.image?.message}</p>
                <input type="submit" value="Upload" className="bg-green-300" />
              </form>
        </DialogContent>
        </Dialog>

            
    );
  }