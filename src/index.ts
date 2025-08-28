#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

class DocuSealMCPServer {
  private server: Server;
  private readonly baseURL: string;

  constructor() {
    // Use self-hosted URL if provided, fallback to cloud
    this.baseURL = process.env.DOCUSEAL_BASE_URL || 'https://api.docuseal.co';
    
    this.server = new Server(
      {
        name: 'docuseal-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private async fetchAPI(
    endpoint: string,
    options: {
      method?: string;
      headers?: Record<string, string>;
      body?: any;
    } = {}
  ) {
    const { method = 'GET', headers = {}, body } = options;
    
    const apiKey = process.env.DOCUSEAL_API_KEY;
    if (!apiKey) {
      throw new Error('DocuSeal API key is required. Set the DOCUSEAL_API_KEY environment variable.');
    }
    
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Auth-Token': apiKey,
      ...headers,
    };

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, requestOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Templates Tools
          {
            name: 'docuseal_list_templates',
            description: 'List all document templates from DocuSeal',
            inputSchema: {
              type: 'object',
              properties: {
                application_key: {
                  type: 'string',
                  description: 'Filter templates by application key',
                },
                folder: {
                  type: 'string',
                  description: 'Filter templates by folder name',
                },
                archived: {
                  type: 'boolean',
                  description: 'Get archived templates instead of active ones',
                },
                limit: {
                  type: 'number',
                  description: 'Number of templates to return (max 100)',
                  default: 10,
                },
              },
              required: [],
            },
          },
          {
            name: 'docuseal_get_template',
            description: 'Get detailed information about a specific template',
            inputSchema: {
              type: 'object',
              properties: {
                template_id: {
                  type: 'number',
                  description: 'The unique identifier of the template',
                },
              },
              required: ['template_id'],
            },
          },
          {
            name: 'docuseal_clone_template',
            description: 'Clone an existing template into a new template',
            inputSchema: {
              type: 'object',
              properties: {
                template_id: {
                  type: 'number',
                  description: 'The unique identifier of the template to clone',
                },
                name: {
                  type: 'string',
                  description: 'Name for the new cloned template',
                },
                folder_name: {
                  type: 'string',
                  description: 'Folder name for the cloned template',
                },
                application_key: {
                  type: 'string',
                  description: 'Application key for the cloned template',
                },
              },
              required: ['template_id'],
            },
          },
          {
            name: 'docuseal_archive_template',
            description: 'Archive (soft delete) a template',
            inputSchema: {
              type: 'object',
              properties: {
                template_id: {
                  type: 'number',
                  description: 'The unique identifier of the template to archive',
                },
              },
              required: ['template_id'],
            },
          },
          {
            name: 'docuseal_create_template_from_pdf',
            description: 'Create a template from an existing PDF with form fields',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name for the template',
                },
                documents: {
                  type: 'array',
                  description: 'Array of documents with fields',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      file: { type: 'string', description: 'Base64 encoded file content' },
                      fields: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            role: { type: 'string' },
                            type: { 
                              type: 'string',
                              enum: ['text', 'signature', 'date', 'checkbox', 'radio', 'select', 'phone', 'email', 'number', 'image', 'file']
                            },
                            areas: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  x: { type: 'number' },
                                  y: { type: 'number' },
                                  w: { type: 'number' },
                                  h: { type: 'number' },
                                  page: { type: 'number' }
                                },
                                required: ['x', 'y', 'w', 'h', 'page']
                              }
                            }
                          },
                          required: ['name', 'role', 'type', 'areas']
                        }
                      }
                    },
                    required: ['name', 'file']
                  }
                },
                folder_name: {
                  type: 'string',
                  description: 'Folder name for the template',
                },
                application_key: {
                  type: 'string',
                  description: 'Application key for the template',
                },
              },
              required: ['name', 'documents'],
            },
          },

          // Submissions Tools
          {
            name: 'docuseal_list_submissions',
            description: 'List all submissions with optional filtering',
            inputSchema: {
              type: 'object',
              properties: {
                template_id: {
                  type: 'number',
                  description: 'Filter by template ID',
                },
                application_key: {
                  type: 'string',
                  description: 'Filter by application key',
                },
                template_folder: {
                  type: 'string',
                  description: 'Filter by template folder name',
                },
                limit: {
                  type: 'number',
                  description: 'Number of submissions to return (max 100)',
                  default: 10,
                },
              },
              required: [],
            },
          },
          {
            name: 'docuseal_get_submission',
            description: 'Get detailed information about a specific submission',
            inputSchema: {
              type: 'object',
              properties: {
                submission_id: {
                  type: 'number',
                  description: 'The unique identifier of the submission',
                },
              },
              required: ['submission_id'],
            },
          },
          {
            name: 'docuseal_create_submission',
            description: 'Create a new submission for document signing',
            inputSchema: {
              type: 'object',
              properties: {
                template_id: {
                  type: 'number',
                  description: 'Template ID to create submission from',
                },
                submitters: {
                  type: 'array',
                  description: 'Array of submitters for the document',
                  items: {
                    type: 'object',
                    properties: {
                      email: { type: 'string', format: 'email' },
                      name: { type: 'string' },
                      role: { type: 'string' },
                      phone: { type: 'string' },
                      send_email: { type: 'boolean', default: true },
                      send_sms: { type: 'boolean', default: false },
                      values: { 
                        type: 'object',
                        description: 'Pre-filled field values'
                      },
                    },
                    required: ['email', 'role']
                  }
                },
                send_email: {
                  type: 'boolean',
                  description: 'Whether to send email notifications',
                  default: true,
                },
                order: {
                  type: 'string',
                  enum: ['preserved', 'random'],
                  description: 'Order of submitters signing',
                  default: 'preserved',
                },
                message: {
                  type: 'object',
                  properties: {
                    subject: { type: 'string' },
                    body: { type: 'string' }
                  },
                  description: 'Custom email message'
                },
              },
              required: ['template_id', 'submitters'],
            },
          },
          {
            name: 'docuseal_archive_submission',
            description: 'Archive (soft delete) a submission',
            inputSchema: {
              type: 'object',
              properties: {
                submission_id: {
                  type: 'number',
                  description: 'The unique identifier of the submission to archive',
                },
              },
              required: ['submission_id'],
            },
          },

          // Submitters Tools
          {
            name: 'docuseal_list_submitters',
            description: 'List all submitters with optional filtering',
            inputSchema: {
              type: 'object',
              properties: {
                submission_id: {
                  type: 'number',
                  description: 'Filter by submission ID',
                },
                application_key: {
                  type: 'string',
                  description: 'Filter by application key',
                },
                limit: {
                  type: 'number',
                  description: 'Number of submitters to return (max 100)',
                  default: 10,
                },
              },
              required: [],
            },
          },
          {
            name: 'docuseal_get_submitter',
            description: 'Get detailed information about a specific submitter',
            inputSchema: {
              type: 'object',
              properties: {
                submitter_id: {
                  type: 'number',
                  description: 'The unique identifier of the submitter',
                },
              },
              required: ['submitter_id'],
            },
          },
          {
            name: 'docuseal_update_submitter',
            description: 'Update submitter details, field values, and re-send emails',
            inputSchema: {
              type: 'object',
              properties: {
                submitter_id: {
                  type: 'number',
                  description: 'The unique identifier of the submitter',
                },
                name: {
                  type: 'string',
                  description: 'Submitter name',
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'Submitter email',
                },
                phone: {
                  type: 'string',
                  description: 'Submitter phone',
                },
                values: {
                  type: 'object',
                  description: 'Field values to update',
                },
                send_email: {
                  type: 'boolean',
                  description: 'Whether to re-send email notification',
                },
                message: {
                  type: 'object',
                  properties: {
                    subject: { type: 'string' },
                    body: { type: 'string' }
                  },
                  description: 'Custom email message'
                },
              },
              required: ['submitter_id'],
            },
          },
        ] satisfies Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Template handlers
          case 'docuseal_list_templates':
            return await this.handleListTemplates(args as any);
          case 'docuseal_get_template':
            return await this.handleGetTemplate(args as any);
          case 'docuseal_clone_template':
            return await this.handleCloneTemplate(args as any);
          case 'docuseal_archive_template':
            return await this.handleArchiveTemplate(args as any);
          case 'docuseal_create_template_from_pdf':
            return await this.handleCreateTemplateFromPdf(args as any);

          // Submission handlers
          case 'docuseal_list_submissions':
            return await this.handleListSubmissions(args as any);
          case 'docuseal_get_submission':
            return await this.handleGetSubmission(args as any);
          case 'docuseal_create_submission':
            return await this.handleCreateSubmission(args as any);
          case 'docuseal_archive_submission':
            return await this.handleArchiveSubmission(args as any);

          // Submitter handlers
          case 'docuseal_list_submitters':
            return await this.handleListSubmitters(args as any);
          case 'docuseal_get_submitter':
            return await this.handleGetSubmitter(args as any);
          case 'docuseal_update_submitter':
            return await this.handleUpdateSubmitter(args as any);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  // Template handlers
  private async handleListTemplates(args: {
    application_key?: string;
    folder?: string;
    archived?: boolean;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (args.application_key) params.append('application_key', args.application_key);
    if (args.folder) params.append('folder', args.folder);
    if (args.archived) params.append('archived', args.archived.toString());
    if (args.limit) params.append('limit', args.limit.toString());

    const data = await this.fetchAPI(`/templates?${params}`, {
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleGetTemplate(args: { api_key: string; template_id: number }) {
    const data = await this.fetchAPI(`/templates/${args.template_id}`, {
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleCloneTemplate(args: {
    template_id: number;
    name?: string;
    folder_name?: string;
    application_key?: string;
  }) {
    const payload: any = {};
    if (args.name) payload.name = args.name;
    if (args.folder_name) payload.folder_name = args.folder_name;
    if (args.application_key) payload.application_key = args.application_key;

    const data = await this.fetchAPI(`/templates/${args.template_id}/clone`, {
      method: 'POST',
      body: payload,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleArchiveTemplate(args: { api_key: string; template_id: number }) {
    const data = await this.fetchAPI(`/templates/${args.template_id}`, {
      method: 'DELETE',
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleCreateTemplateFromPdf(args: {
    name: string;
    documents: Array<{
      name: string;
      file: string;
      fields?: Array<{
        name: string;
        role: string;
        type: string;
        areas: Array<{ x: number; y: number; w: number; h: number; page: number }>;
      }>;
    }>;
    folder_name?: string;
    application_key?: string;
  }) {
    const payload: any = {
      name: args.name,
      documents: args.documents,
    };
    if (args.folder_name) payload.folder_name = args.folder_name;
    if (args.application_key) payload.application_key = args.application_key;

    const data = await this.fetchAPI('/templates/pdf', {
      method: 'POST',
      body: payload,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  // Submission handlers
  private async handleListSubmissions(args: {
    template_id?: number;
    application_key?: string;
    template_folder?: string;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (args.template_id) params.append('template_id', args.template_id.toString());
    if (args.application_key) params.append('application_key', args.application_key);
    if (args.template_folder) params.append('template_folder', args.template_folder);
    if (args.limit) params.append('limit', args.limit.toString());

    const data = await this.fetchAPI(`/submissions?${params}`, {
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleGetSubmission(args: { api_key: string; submission_id: number }) {
    const data = await this.fetchAPI(`/submissions/${args.submission_id}`, {
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleCreateSubmission(args: {
    template_id: number;
    submitters: Array<{
      email: string;
      name?: string;
      role: string;
      phone?: string;
      send_email?: boolean;
      send_sms?: boolean;
      values?: object;
    }>;
    send_email?: boolean;
    order?: string;
    message?: { subject?: string; body?: string };
  }) {
    const payload = {
      template_id: args.template_id,
      submission: [{
        submitters: args.submitters,
      }],
      send_email: args.send_email ?? true,
      order: args.order ?? 'preserved',
    };

    if (args.message) {
      (payload as any).message = args.message;
    }

    const data = await this.fetchAPI('/submissions', {
      method: 'POST',
      body: payload,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleArchiveSubmission(args: { api_key: string; submission_id: number }) {
    const data = await this.fetchAPI(`/submissions/${args.submission_id}`, {
      method: 'DELETE',
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  // Submitter handlers
  private async handleListSubmitters(args: {
    submission_id?: number;
    application_key?: string;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (args.submission_id) params.append('submission_id', args.submission_id.toString());
    if (args.application_key) params.append('application_key', args.application_key);
    if (args.limit) params.append('limit', args.limit.toString());

    const data = await this.fetchAPI(`/submitters?${params}`, {
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleGetSubmitter(args: { api_key: string; submitter_id: number }) {
    const data = await this.fetchAPI(`/submitters/${args.submitter_id}`, {
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async handleUpdateSubmitter(args: {
    submitter_id: number;
    name?: string;
    email?: string;
    phone?: string;
    values?: object;
    send_email?: boolean;
    message?: { subject?: string; body?: string };
  }) {
    const payload: any = {};
    if (args.name) payload.name = args.name;
    if (args.email) payload.email = args.email;
    if (args.phone) payload.phone = args.phone;
    if (args.values) payload.values = args.values;
    if (args.send_email !== undefined) payload.send_email = args.send_email;
    if (args.message) payload.message = args.message;

    const data = await this.fetchAPI(`/submitters/${args.submitter_id}`, {
      method: 'PUT',
      body: payload,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('DocuSeal MCP server running on stdio');
  }
}

const server = new DocuSealMCPServer();
server.run().catch(console.error);