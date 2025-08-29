
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, AlertCircle, CheckCircle, XCircle, MoreHorizontal, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Ticket {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  type: 'bug' | 'feature' | 'task' | 'support';
  assignedTo?: string;
  reportedBy: string;
  tags?: string;
  estimatedHours?: string;
  actualHours?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const statusIcons = {
  open: <AlertCircle className="h-4 w-4" />,
  in_progress: <Clock className="h-4 w-4" />,
  resolved: <CheckCircle className="h-4 w-4" />,
  closed: <XCircle className="h-4 w-4" />,
};

export function TicketingSystem() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');

  // Form states
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    type: 'bug' as const,
    projectId: '',
    estimatedHours: '',
    dueDate: '',
    tags: '',
  });
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTickets(selectedProject);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchTickets = async (projectId?: string) => {
    try {
      const url = projectId ? `/api/tickets?projectId=${projectId}` : '/api/tickets';
      const response = await fetch(url, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const createProject = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newProject),
      });
      
      if (response.ok) {
        await fetchProjects();
        setNewProject({ name: '', description: '' });
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const createTicket = async () => {
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...newTicket,
          estimatedHours: newTicket.estimatedHours ? parseFloat(newTicket.estimatedHours) : undefined,
          dueDate: newTicket.dueDate ? new Date(newTicket.dueDate).toISOString() : undefined,
        }),
      });
      
      if (response.ok) {
        await fetchTickets(selectedProject);
        setNewTicket({
          title: '',
          description: '',
          priority: 'medium',
          type: 'bug',
          projectId: '',
          estimatedHours: '',
          dueDate: '',
          tags: '',
        });
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  const addComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;

    try {
      const response = await fetch(`/api/tickets/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: newComment,
          isInternal: false,
        }),
      });
      
      if (response.ok) {
        await fetchComments(selectedTicket.id);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        await fetchTickets(selectedProject);
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: status as any });
        }
      }
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">IT Ticketing System</h1>
          <p className="text-muted-foreground">Manage support tickets and projects</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>Add a new project to organize your tickets</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Enter project description"
                  />
                </div>
                <Button onClick={createProject} className="w-full">
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Ticket</DialogTitle>
                <DialogDescription>Report a new issue or request</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ticket-project">Project</Label>
                    <Select value={newTicket.projectId} onValueChange={(value) => setNewTicket({ ...newTicket, projectId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ticket-type">Type</Label>
                    <Select value={newTicket.type} onValueChange={(value: any) => setNewTicket({ ...newTicket, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">Bug</SelectItem>
                        <SelectItem value="feature">Feature</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="ticket-title">Title</Label>
                  <Input
                    id="ticket-title"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    placeholder="Enter ticket title"
                  />
                </div>

                <div>
                  <Label htmlFor="ticket-description">Description</Label>
                  <Textarea
                    id="ticket-description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    placeholder="Describe the issue or request"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="ticket-priority">Priority</Label>
                    <Select value={newTicket.priority} onValueChange={(value: any) => setNewTicket({ ...newTicket, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ticket-hours">Estimated Hours</Label>
                    <Input
                      id="ticket-hours"
                      type="number"
                      value={newTicket.estimatedHours}
                      onChange={(e) => setNewTicket({ ...newTicket, estimatedHours: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ticket-due">Due Date</Label>
                    <Input
                      id="ticket-due"
                      type="date"
                      value={newTicket.dueDate}
                      onChange={(e) => setNewTicket({ ...newTicket, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="ticket-tags">Tags</Label>
                  <Input
                    id="ticket-tags"
                    value={newTicket.tags}
                    onChange={(e) => setNewTicket({ ...newTicket, tags: e.target.value })}
                    placeholder="Enter tags separated by commas"
                  />
                </div>

                <Button onClick={createTicket} className="w-full">
                  Create Ticket
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <div className="flex gap-4 items-center">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {statusIcons[ticket.status]}
                        <h3 className="font-semibold">{ticket.title}</h3>
                        <Badge className={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
                        <Badge variant="outline">{ticket.type}</Badge>
                      </div>
                      
                      {ticket.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {ticket.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                        </div>
                        {ticket.estimatedHours && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {ticket.estimatedHours}h estimated
                          </div>
                        )}
                        {ticket.tags && (
                          <div className="flex gap-1">
                            {ticket.tags.split(',').map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select value={ticket.status} onValueChange={(value) => updateTicketStatus(ticket.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              fetchComments(ticket.id);
                            }}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          {selectedTicket && (
                            <>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  {statusIcons[selectedTicket.status]}
                                  {selectedTicket.title}
                                </DialogTitle>
                                <DialogDescription>
                                  Created {format(new Date(selectedTicket.createdAt), 'PPP')}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-6">
                                <div className="flex gap-2">
                                  <Badge className={priorityColors[selectedTicket.priority]}>
                                    {selectedTicket.priority}
                                  </Badge>
                                  <Badge variant="outline">{selectedTicket.type}</Badge>
                                  <Badge variant="secondary">{selectedTicket.status}</Badge>
                                </div>
                                
                                {selectedTicket.description && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Description</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                      {selectedTicket.description}
                                    </p>
                                  </div>
                                )}
                                
                                <Separator />
                                
                                <div>
                                  <h4 className="font-semibold mb-4">Comments</h4>
                                  <div className="space-y-4 max-h-60 overflow-y-auto">
                                    {comments.map((comment) => (
                                      <div key={comment.id} className="border rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                          <User className="h-4 w-4" />
                                          <span className="text-sm font-medium">User</span>
                                          <span className="text-xs text-muted-foreground">
                                            {format(new Date(comment.createdAt), 'PPp')}
                                          </span>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  <div className="mt-4 space-y-2">
                                    <Textarea
                                      value={newComment}
                                      onChange={(e) => setNewComment(e.target.value)}
                                      placeholder="Add a comment..."
                                      rows={3}
                                    />
                                    <Button onClick={addComment} disabled={!newComment.trim()}>
                                      Add Comment
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  {project.description && (
                    <CardDescription>{project.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(project.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedProject(project.id)}
                      className="w-full"
                    >
                      View Tickets
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
