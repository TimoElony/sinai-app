import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import { Button } from "./ui/button";


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
    faYear?: number;
    faMonth?: number;
    faDay?: number;
}

export default function RouteDetailsModal({name, grade, length, bolts, pitches, faGrade, description, approach, descent, credit, faYear, faMonth, faDay}: RouteDetailsProps) {
  
  // Format the first ascent date
  const formatFADate = () => {
    if (!faYear || !faMonth) return "Unknown";
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Validate month is in range before accessing array
    if (faMonth < 1 || faMonth > 12) return "Unknown";
    
    const monthStr = monthNames[faMonth - 1];
    
    if (faDay && faDay > 0) {
      return `${faDay} ${monthStr} ${faYear}`;
    }
    return `${monthStr} ${faYear}`;
  };

  return(
    <Dialog>
    <DialogTrigger asChild><Button variant="link">{name}</Button></DialogTrigger>
    <DialogContent>
        <DialogHeader>
        <DialogTitle>{name}</DialogTitle>
        <DialogDescription className="flex flex-col gap-2">
            <p><strong>Grade:</strong> {grade}</p>
            <p><strong>Length:</strong> {length}m</p>
            <p><strong>Bolts:</strong> {bolts}</p>
            <p><strong>Pitches:</strong> {pitches}</p>
            <p><strong>First Ascent Grade:</strong> {faGrade}</p>
            <p><strong>First Ascent Date:</strong> {formatFADate()}</p>
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