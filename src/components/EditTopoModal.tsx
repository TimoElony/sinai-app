import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";

  export default function EditTopoModal(){

    return(
        <Dialog>
        <DialogTrigger><Button>Select Route to add or edit</Button></DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Create new route</DialogTitle>
            <DialogDescription>
            </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

            
    );
  }