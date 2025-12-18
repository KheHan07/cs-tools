export interface Comment {
  id: string;
  author: {
    name: string;
    role: "customer" | "engineer";
  };
  content: string;
  timestamp: string;
  isLarge?: boolean;
  hasCode?: boolean;
}

export interface CallRequest {
  sysId: string;
  number: string;
  requestedDate: string;
  state: string;
  reason: string;
  duration: string;
  preferredTime: string;
}

export interface Attachment {
  sysId: string;
  name: string;
  sizeBytes: number;
  uploadedBy: string;
  uploadedDate: string;
}

export interface KBArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  suggestedBy: "AI" | "Engineer" | "Customer";
  suggestedDate: string;
  views: number;
}

export interface CaseDetails {
  sysId: string;
  number: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  createdOn: string;
  updatedOn: string;
  assignedEngineer: string;
  //engineerEmail: string;
  product: string;
  environment: string;
  category: string;
  accountType: string;
  organization: string;
  sla: string;
  initialComments: Comment[];
  attachments: Attachment[];
  callRequests: CallRequest[];
  kbArticles: KBArticle[];
}
