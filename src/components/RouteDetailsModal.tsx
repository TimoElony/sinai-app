import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


interface RouteDetailsProps {
    name: string;
    grade: string;
    length: number;
    bolts: number;
    pitches: number;
    faGrade: string;
    description: string;
    approach: string;
    descent: string;
    credit: string;
}

export default function RouteDetailsModal({name, grade, length, bolts, pitches, faGrade, description, approach, descent, credit}: RouteDetailsProps) {
  
  return(
    <Dialog>
    <DialogTrigger>{name}&#128712;</DialogTrigger>
    <DialogContent>
        <DialogHeader>
        <DialogTitle>{name}</DialogTitle>
        <DialogDescription className="flex flex-col gap-2">
            <p><strong>Grade:</strong> {grade}</p>
            <p><strong>Length:</strong> {length}m</p>
            <p><strong>Bolts:</strong> {bolts}</p>
            <p><strong>Pitches:</strong> {pitches}</p>
            <p><strong>First Ascent Grade:</strong> {faGrade}</p>
            <p><strong>Description:</strong> {description}</p>
            <p><strong>Access:</strong> {approach}</p>
            <p><strong>Descent:</strong> {descent}</p>
            <p><strong>Credit:</strong> {credit}</p>
        </DialogDescription>
        </DialogHeader>
    </DialogContent>
    </Dialog>   
  )
}