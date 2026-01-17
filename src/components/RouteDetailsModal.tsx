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
    // If no year at all, return Unknown
    if (faYear === undefined || faYear === null || faYear === 0) return "Unknown";
    
    // If we have at least a year, show it
    if (faMonth === undefined || faMonth === null || faMonth === 0) {
      return `${faYear}`;
    }
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Validate month is in range before accessing array
    if (faMonth < 1 || faMonth > 12) return `${faYear}`;
    
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
            <div><strong>Grade:</strong> {grade}</div>
            <div><strong>Length:</strong> {length}m</div>
            <div><strong>Bolts:</strong> {bolts}</div>
            <div><strong>Pitches:</strong> {pitches}</div>
            <div><strong>First Ascent Grade:</strong> {faGrade}</div>
            <div><strong>First Ascent Date:</strong> {formatFADate()}</div>
            <div><strong>Description:</strong> {description}</div>
            <div><strong>Access:</strong> {approach}</div>
            <div><strong>Descent:</strong> {descent}</div>
            <div><strong>Credit:</strong> {credit}</div>
        </DialogDescription>
        </DialogHeader>
    </DialogContent>
    </Dialog>   
  )
}