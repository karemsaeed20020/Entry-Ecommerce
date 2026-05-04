import { useState, useEffect, useCallback } from "react";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { useToast } from "../../hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { 
  Mail, 
  Trash2, 
  Eye, 
  Search, 
  User, 
  Calendar,
  MessageSquare,
  AlertCircle,
  Send
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  
  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get("/contact");
      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load contact messages",
      });
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, toast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleDelete = async () => {
    if (!messageToDelete) return;
    
    try {
      const response = await axiosPrivate.delete(`/contact/${messageToDelete}`);
      if (response.data.success) {
        setMessages(messages.filter((m) => m._id !== messageToDelete));
        toast({
          title: "Success",
          description: "Message deleted successfully",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete message",
      });
    } finally {
      setIsDeleteOpen(false);
      setMessageToDelete(null);
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) return;

    setIsSubmittingReply(true);
    try {
      const response = await axiosPrivate.post(`/contact/${selectedMessage._id}/reply`, {
        message: replyMessage,
      });

      if (response.data.success) {
        toast({
          title: "Reply Sent",
          description: "Your reply has been sent and a notification has been created.",
        });
        setIsReplyOpen(false);
        setReplyMessage("");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to send reply",
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const filteredMessages = messages.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-500">View and manage customer inquiries</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" onClick={fetchMessages} className="gap-2">
             <RefreshCw className="w-4 h-4" /> Refresh
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{messages.length}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">New Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {messages.filter(m => new Date(m.createdAt).toDateString() === new Date().toDateString()).length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {/* Note: Read/Unread status not in model yet, but could be added */}
              {messages.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Inbox
            </CardTitle>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search messages..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead>Customer</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => (
                    <TableRow key={message._id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => {
                      setSelectedMessage(message);
                      setIsViewOpen(true);
                    }}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{message.name}</span>
                          <span className="text-xs text-gray-500">{message.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-800 line-clamp-1">{message.subject}</span>
                        <p className="text-xs text-gray-500 line-clamp-1">{message.message}</p>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setSelectedMessage(message);
                              setIsViewOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setMessageToDelete(message._id);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <MessageSquare className="w-8 h-8 text-gray-300" />
                        <p>No messages found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Message View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Message Details
            </DialogTitle>
            <DialogDescription>
              Received on {selectedMessage && new Date(selectedMessage.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase">From</span>
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <User className="w-4 h-4 text-blue-500" />
                    {selectedMessage.name}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase">Email</span>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-blue-500" />
                    {selectedMessage.email}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase">Subject</span>
                <p className="text-lg font-bold text-gray-900">{selectedMessage.subject}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase">Message</span>
                <div className="p-4 rounded-lg bg-gray-50 text-gray-800 whitespace-pre-wrap border italic">
                  "{selectedMessage.message}"
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                  onClick={() => {
                    setIsViewOpen(false);
                    setIsReplyOpen(true);
                  }}
                >
                  <Mail className="w-4 h-4" /> Reply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Reply to Message
            </DialogTitle>
            <DialogDescription>
              Sending a reply to {selectedMessage?.name} ({selectedMessage?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="bg-gray-50 p-3 rounded border text-sm text-gray-600 italic">
              Original Message: "{selectedMessage?.message}"
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Reply</label>
              <Textarea 
                placeholder="Type your reply here..." 
                className="min-h-[150px] resize-none"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsReplyOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleReply} 
                disabled={isSubmittingReply || !replyMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                {isSubmittingReply ? "Sending..." : <><Send className="w-4 h-4" /> Send Reply</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the message from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMessageToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RefreshCw({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}
