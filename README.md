# DocuSeal MCP Server

MCP server for DocuSeal document signing and template management. This server provides tools to interact with DocuSeal's API for managing templates, submissions, and submitters.

## Features

### Templates
- List all templates with filtering options
- Get detailed template information
- Clone existing templates
- Archive templates
- Create templates from PDF files

### Submissions
- List submissions with filtering
- Get detailed submission information
- Create new submissions for document signing
- Archive submissions

### Submitters
- List submitters with filtering
- Get detailed submitter information
- Update submitter details and field values
- Re-send email notifications

## Installation

### Via NPX (Recommended)

```bash
npx docuseal-mcp
```

### Via NPM Global Install

```bash
npm install -g docuseal-mcp
```

## Configuration

### 1. Get Your API Key
1. Visit [DocuSeal Console](https://console.docuseal.com/api)
2. Copy your X-Auth-Token

### 2. Configure Claude Desktop

Add the server to your Claude Desktop configuration file with your API key.

**Important:** The API key MUST be configured in the environment - it's the only way to authenticate with DocuSeal.

#### macOS
File location: `~/Library/Application Support/Claude/claude_desktop_config.json`

#### Windows
File location: `%APPDATA%/Claude/claude_desktop_config.json`

#### Configuration Content
```json
{
  "mcpServers": {
    "docuseal": {
      "command": "npx",
      "args": ["-y", "docuseal-mcp"],
      "env": {
        "DOCUSEAL_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**If installed globally:**
```json
{
  "mcpServers": {
    "docuseal": {
      "command": "docuseal-mcp",
      "env": {
        "DOCUSEAL_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 3. Restart Claude Desktop

After updating the configuration, restart Claude Desktop to load the MCP server with your API key.

## Available Tools

### Template Management

#### `docuseal_list_templates`
List all document templates from DocuSeal.

**Note:** API key is automatically used from the DOCUSEAL_API_KEY environment variable configured in Claude Desktop.
- `application_key` (optional): Filter by application key
- `folder` (optional): Filter by folder name
- `archived` (optional): Get archived templates instead of active ones
- `limit` (optional): Number of templates to return (max 100, default 10)

#### `docuseal_get_template`
Get detailed information about a specific template.

**Note:** API key is automatically used from the DOCUSEAL_API_KEY environment variable configured in Claude Desktop.
- `template_id` (required): The unique identifier of the template

#### `docuseal_clone_template`
Clone an existing template into a new template.

**Note:** API key is automatically used from the DOCUSEAL_API_KEY environment variable configured in Claude Desktop.
- `template_id` (required): The unique identifier of the template to clone
- `name` (optional): Name for the new cloned template
- `folder_name` (optional): Folder name for the cloned template
- `application_key` (optional): Application key for the cloned template

#### `docuseal_archive_template`
Archive (soft delete) a template.

**Note:** API key is automatically used from the DOCUSEAL_API_KEY environment variable configured in Claude Desktop.
- `template_id` (required): The unique identifier of the template to archive

#### `docuseal_create_template_from_pdf`
Create a template from an existing PDF with form fields.

**Note:** API key is automatically used from the DOCUSEAL_API_KEY environment variable configured in Claude Desktop.
- `name` (required): Name for the template
- `documents` (required): Array of documents with fields configuration
- `folder_name` (optional): Folder name for the template
- `application_key` (optional): Application key for the template

### Submission Management

#### `docuseal_list_submissions`
List all submissions with optional filtering.

**Note:** API key is automatically used from the DOCUSEAL_API_KEY environment variable configured in Claude Desktop.
- `template_id` (optional): Filter by template ID
- `application_key` (optional): Filter by application key
- `template_folder` (optional): Filter by template folder name
- `limit` (optional): Number of submissions to return (max 100, default 10)

#### `docuseal_get_submission`
Get detailed information about a specific submission.

**Note:** API key is automatically used from the DOCUSEAL_API_KEY environment variable configured in Claude Desktop.
- `submission_id` (required): The unique identifier of the submission

#### `docuseal_create_submission`
Create a new submission for document signing.

**Note:** API key is automatically used from the DOCUSEAL_API_KEY environment variable configured in Claude Desktop.
- `template_id` (required): Template ID to create submission from
- `submitters` (required): Array of submitters for the document
- `send_email` (optional): Whether to send email notifications (default: true)
- `order` (optional): Order of submitters signing ('preserved' or 'random', default: 'preserved')
- `message` (optional): Custom email message with subject and body

#### `docuseal_archive_submission`
Archive (soft delete) a submission.

**Note:** API key is automatically used from the DOCUSEAL_API_KEY environment variable configured in Claude Desktop.
- `submission_id` (required): The unique identifier of the submission to archive

### Submitter Management

#### `docuseal_list_submitters`
List all submitters with optional filtering.

**Note:** API key is automatically used from the DOCUSEAL_API_KEY environment variable configured in Claude Desktop.
- `submission_id` (optional): Filter by submission ID
- `application_key` (optional): Filter by application key
- `limit` (optional): Number of submitters to return (max 100, default 10)

#### `docuseal_get_submitter`
Get detailed information about a specific submitter.

**Note:** API key is automatically used from the DOCUSEAL_API_KEY environment variable configured in Claude Desktop.
- `submitter_id` (required): The unique identifier of the submitter

#### `docuseal_update_submitter`
Update submitter details, field values, and re-send emails.

**Note:** API key is automatically used from the DOCUSEAL_API_KEY environment variable configured in Claude Desktop.
- `submitter_id` (required): The unique identifier of the submitter
- `name` (optional): Submitter name
- `email` (optional): Submitter email
- `phone` (optional): Submitter phone
- `values` (optional): Field values to update
- `send_email` (optional): Whether to re-send email notification
- `message` (optional): Custom email message with subject and body

## Example Usage

Once configured with Claude Desktop, you can use natural language to interact with DocuSeal:

- "List all my DocuSeal templates"
- "Create a new submission for template ID 123 with John Doe's email"
- "Get the status of submission 456"
- "Clone template 789 with a new name"
- "Archive the old contract template"

**Note**: Since your API key is configured in the environment, you don't need to provide it in your requests to Claude!

## Development

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Test locally: `npm run dev`

### Building

```bash
npm run build
```

The built files will be in the `build/` directory.

## API Documentation

For more detailed API documentation, visit:
- [DocuSeal API Documentation](https://www.docuseal.com/docs/api)
- [DocuSeal Console](https://console.docuseal.com/api)

## License

MIT

## Support

For support with this MCP server, please open an issue on GitHub.

For DocuSeal API support, visit [DocuSeal's documentation](https://www.docuseal.com/docs/api).