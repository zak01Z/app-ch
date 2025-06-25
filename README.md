# WhatsApp Business Cloud API Integration

A full-stack Node.js web application that integrates with the WhatsApp Business Cloud API, featuring agent routing, real-time messaging, and a WhatsApp Web-like interface.

## Features

### ✅ Core Functionality
- **WhatsApp Integration**: Send and receive text, image, and audio messages
- **Webhook Support**: Real-time message processing from WhatsApp
- **Agent Routing**: Automatic distribution of conversations to available agents
- **Real-time Updates**: Live message updates using Socket.IO
- **Authentication**: Role-based access control for agents and admins

### ✅ User Roles
- **Agents**: View and respond to assigned conversations only
- **Admin**: View all conversations and manage agents

### ✅ Modern UI
- WhatsApp Web-inspired interface
- Responsive design with Tailwind CSS
- Real-time message updates
- File upload support for images and audio

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js with JWT
- **Real-time**: Socket.IO
- **WhatsApp API**: WhatsApp Business Cloud API v18.0

## Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`env
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_VERIFY_TOKEN=your_verify_token

# Database
MONGODB_URI=mongodb://localhost:27017/whatsapp-business

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
\`\`\`

## Installation & Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd whatsapp-business-app
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   - Copy \`.env.example\` to \`.env.local\`
   - Fill in your WhatsApp Business API credentials
   - Set up MongoDB connection string

4. **Start MongoDB**
   \`\`\`bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   \`\`\`

5. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Use demo credentials:
     - Agent: \`agent@demo.com\` / \`password\`
     - Admin: \`admin@demo.com\` / \`password\`

## WhatsApp Business API Setup

1. **Create a WhatsApp Business Account**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app and add WhatsApp Business API

2. **Configure Webhook**
   - Set webhook URL: \`https://your-domain.com/api/webhook/whatsapp\`
   - Set verify token (same as \`WHATSAPP_VERIFY_TOKEN\`)
   - Subscribe to \`messages\` events

3. **Get API Credentials**
   - Access Token: From your WhatsApp Business API app
   - Phone Number ID: From your WhatsApp Business phone number
   - Business Account ID: From your WhatsApp Business account

## Project Structure

\`\`\`
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication
│   │   ├── webhook/           # WhatsApp webhook
│   │   ├── messages/          # Message handling
│   │   ├── conversations/     # Conversation management
│   │   └── admin/             # Admin endpoints
│   ├── agent/                 # Agent dashboard
│   ├── admin/                 # Admin dashboard
│   └── login/                 # Login page
├── components/                # React components
│   ├── ui/                    # shadcn/ui components
│   ├── chat-interface.tsx     # Main chat component
│   └── conversation-list.tsx  # Conversation sidebar
├── lib/                       # Utility functions
│   ├── auth.ts               # NextAuth configuration
│   ├── mongodb.ts            # Database connection
│   ├── whatsapp.ts           # WhatsApp API functions
│   └── agent-router.ts       # Agent assignment logic
├── models/                    # MongoDB models
│   ├── User.ts
│   ├── Conversation.ts
│   └── Message.ts
└── types/                     # TypeScript definitions
\`\`\`

## Key Features Explained

### Agent Routing System
- Automatically assigns new conversations to agents with the lowest workload
- Round-robin distribution ensures fair assignment
- Agents only see conversations assigned to them

### Real-time Communication
- Socket.IO integration for live message updates
- Automatic conversation list refresh
- Real-time typing indicators and message status

### WhatsApp Integration
- Webhook processing for incoming messages
- Support for text, image, and audio messages
- Media download and storage handling
- Message status tracking

### Security Features
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting on API endpoints

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- **Render**: Node.js deployment with MongoDB
- **Railway**: Full-stack deployment
- **DigitalOcean**: VPS deployment with Docker

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Agent/Admin login
- `POST /api/auth/signout` - Logout

### WhatsApp Webhook
- `GET /api/webhook/whatsapp` - Webhook verification
- `POST /api/webhook/whatsapp` - Receive WhatsApp messages

### Conversations
- `GET /api/conversations` - Get user's conversations
- `GET /api/conversations/[id]/messages` - Get conversation messages

### Messages
- `POST /api/messages/send` - Send message to WhatsApp

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/agents` - Agent management

## Database Schema

### Users Collection
\`\`\`javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: "admin" | "agent",
  status: "online" | "offline",
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Conversations Collection
\`\`\`javascript
{
  _id: ObjectId,
  customerPhone: String,
  customerName: String,
  assignedAgent: ObjectId (ref: User),
  status: "active" | "resolved" | "pending",
  lastMessage: String,
  lastMessageTime: Date,
  unreadCount: Number,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Messages Collection
\`\`\`javascript
{
  _id: ObjectId,
  conversationId: ObjectId (ref: Conversation),
  content: String,
  type: "text" | "image" | "audio",
  sender: "customer" | "agent",
  timestamp: Date,
  mediaUrl: String (optional),
  whatsappMessageId: String,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Email: support@yourcompany.com
- Documentation: [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)

## Troubleshooting

### Common Issues

1. **Webhook not receiving messages**
   - Verify webhook URL is publicly accessible
   - Check WHATSAPP_VERIFY_TOKEN matches
   - Ensure webhook is subscribed to 'messages' events

2. **Database connection issues**
   - Verify MongoDB is running
   - Check MONGODB_URI format
   - Ensure network connectivity

3. **Authentication problems**
   - Verify NEXTAUTH_SECRET is set
   - Check user credentials in database
   - Clear browser cookies and try again

4. **WhatsApp API errors**
   - Verify access token is valid
   - Check phone number ID is correct
   - Ensure business account is verified

### Performance Optimization

- Implement message pagination for large conversations
- Add Redis caching for frequently accessed data
- Use CDN for media file storage
- Implement database indexing for better query performance

## Future Enhancements

- [ ] Message templates support
- [ ] Bulk messaging capabilities
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Voice message transcription
- [ ] Chatbot integration
- [ ] Customer satisfaction surveys
- [ ] Integration with CRM systems
