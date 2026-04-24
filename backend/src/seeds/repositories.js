const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Repository = require('../models/Repository');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// ──────────────────────────────────────────────
//  Real Indian Colleges & Universities
// ──────────────────────────────────────────────
const SEED_UNIVERSITIES = [
  { name: 'Lovely Professional University', city: 'Phagwara' },
  { name: 'Indian Institute of Technology Delhi', city: 'Delhi' },
  { name: 'Indian Institute of Technology Bombay', city: 'Mumbai' },
  { name: 'National Institute of Technology Tiruchirappalli', city: 'Trichy' },
  { name: 'Vellore Institute of Technology', city: 'Vellore' },
  { name: 'Birla Institute of Technology and Science Pilani', city: 'Pilani' },
  { name: 'Delhi Technological University', city: 'Delhi' },
  { name: 'Jadavpur University', city: 'Kolkata' },
  { name: 'Manipal Institute of Technology', city: 'Manipal' },
  { name: 'SRM Institute of Science and Technology', city: 'Chennai' },
  { name: 'Amity University Noida', city: 'Noida' },
  { name: 'PSG College of Technology', city: 'Coimbatore' },
  { name: 'College of Engineering Pune', city: 'Pune' },
  { name: 'Indian Institute of Information Technology Allahabad', city: 'Prayagraj' },
  { name: 'Chandigarh University', city: 'Mohali' },
];

// ──────────────────────────────────────────────
//  Realistic Capstone Project Code Snippets
// ──────────────────────────────────────────────
const CODE_SNIPPETS = [
  {
    originalName: 'auth_middleware.js',
    projectName: 'Student Portal Authentication',
    description: 'A secure authentication middleware for a university student portal using JWT tokens and role-based access control.',
    content: `const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

/**
 * Middleware to protect routes by verifying JWT tokens.
 * Extracts the Bearer token, validates it, and attaches
 * the student object to the request pipeline.
 */
const verifyStudentToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decoded.studentId).select('-password');
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }
    req.student = student;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Session expired, please login again' });
  }
};

module.exports = { verifyStudentToken };`,
    language: 'JavaScript',
    tags: ['nodejs', 'authentication', 'jwt', 'middleware']
  },
  {
    originalName: 'cnn_classifier.py',
    projectName: 'Medical Image Classifier',
    description: 'A convolutional neural network for classifying chest X-ray images to detect pneumonia using TensorFlow and Keras.',
    content: `import tensorflow as tf
from tensorflow.keras import layers, models, callbacks
from tensorflow.keras.preprocessing.image import ImageDataGenerator

class PneumoniaClassifier:
    """
    CNN-based binary classifier for detecting pneumonia
    from chest X-ray images. Uses transfer learning with
    data augmentation for better generalization.
    """
    def __init__(self, image_size=(150, 150)):
        self.image_size = image_size
        self.model = self._build_architecture()

    def _build_architecture(self):
        model = models.Sequential([
            layers.Conv2D(32, (3, 3), activation='relu', 
                         input_shape=(*self.image_size, 3)),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            
            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            
            layers.GlobalAveragePooling2D(),
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(1, activation='sigmoid')
        ])
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy', 'AUC']
        )
        return model

    def train(self, train_dir, val_dir, epochs=25):
        augmentor = ImageDataGenerator(
            rescale=1./255,
            rotation_range=20,
            horizontal_flip=True,
            zoom_range=0.15
        )
        train_gen = augmentor.flow_from_directory(
            train_dir, target_size=self.image_size,
            batch_size=32, class_mode='binary'
        )
        val_gen = ImageDataGenerator(rescale=1./255).flow_from_directory(
            val_dir, target_size=self.image_size,
            batch_size=32, class_mode='binary'
        )
        
        early_stop = callbacks.EarlyStopping(
            monitor='val_loss', patience=5, restore_best_weights=True
        )
        
        history = self.model.fit(
            train_gen, validation_data=val_gen,
            epochs=epochs, callbacks=[early_stop]
        )
        return history`,
    language: 'Python',
    tags: ['machine-learning', 'deep-learning', 'tensorflow', 'medical-imaging']
  },
  {
    originalName: 'FibonacciDP.java',
    projectName: 'Algorithm Visualizer',
    description: 'An implementation of various dynamic programming algorithms with performance benchmarking for a capstone algorithm analysis project.',
    content: `import java.util.*;

/**
 * Dynamic Programming Solutions for common algorithm problems.
 * Each method includes time and space complexity annotations.
 * Used as the backend engine for the Algorithm Visualizer project.
 */
public class FibonacciDP {

    // O(n) time, O(1) space - space-optimized Fibonacci
    public static long fibonacci(int n) {
        if (n <= 1) return n;
        long prev2 = 0, prev1 = 1;
        for (int i = 2; i <= n; i++) {
            long current = prev1 + prev2;
            prev2 = prev1;
            prev1 = current;
        }
        return prev1;
    }

    // O(n*W) time - 0/1 Knapsack Problem
    public static int knapsack(int[] weights, int[] values, int capacity) {
        int n = weights.length;
        int[][] dp = new int[n + 1][capacity + 1];
        for (int i = 1; i <= n; i++) {
            for (int w = 0; w <= capacity; w++) {
                dp[i][w] = dp[i - 1][w];
                if (weights[i - 1] <= w) {
                    dp[i][w] = Math.max(dp[i][w], 
                        dp[i - 1][w - weights[i - 1]] + values[i - 1]);
                }
            }
        }
        return dp[n][capacity];
    }

    // O(n^2) time - Longest Increasing Subsequence
    public static int longestIncreasingSubsequence(int[] arr) {
        int n = arr.length;
        int[] dp = new int[n];
        Arrays.fill(dp, 1);
        int maxLen = 1;
        for (int i = 1; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (arr[j] < arr[i]) {
                    dp[i] = Math.max(dp[i], dp[j] + 1);
                }
            }
            maxLen = Math.max(maxLen, dp[i]);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println("Fibonacci(20) = " + fibonacci(20));
        int[] w = {2, 3, 4, 5};
        int[] v = {3, 4, 5, 6};
        System.out.println("Knapsack = " + knapsack(w, v, 8));
        int[] seq = {10, 9, 2, 5, 3, 7, 101, 18};
        System.out.println("LIS = " + longestIncreasingSubsequence(seq));
    }
}`,
    language: 'Java',
    tags: ['algorithms', 'dynamic-programming', 'data-structures']
  },
  {
    originalName: 'Dashboard.tsx',
    projectName: 'Campus Event Manager',
    description: 'A React TypeScript dashboard component for managing university campus events with real-time filtering and analytics.',
    content: `import React, { useState, useEffect } from 'react';

interface CampusEvent {
  id: string;
  title: string;
  department: string;
  date: string;
  attendees: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface DashboardProps {
  universityName: string;
}

const EventDashboard: React.FC<DashboardProps> = ({ universityName }) => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const queryParams = filter !== 'all' ? \`?status=\${filter}\` : '';
      const response = await fetch(\`/api/events\${queryParams}\`);
      const data = await response.json();
      setEvents(data.events);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAttendees = events.reduce((sum, e) => sum + e.attendees, 0);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{universityName} - Event Dashboard</h1>
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">{events.length}</span>
            <span className="stat-label">Total Events</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{totalAttendees}</span>
            <span className="stat-label">Total Attendees</span>
          </div>
        </div>
      </header>

      <div className="filters">
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Events</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {isLoading ? (
        <div className="loading-spinner" />
      ) : (
        <div className="events-grid">
          {filteredEvents.map(event => (
            <div key={event.id} className={\`event-card status-\${event.status}\`}>
              <h3>{event.title}</h3>
              <p className="department">{event.department}</p>
              <p className="date">{new Date(event.date).toLocaleDateString()}</p>
              <span className="attendee-badge">{event.attendees} attendees</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventDashboard;`,
    language: 'TypeScript',
    tags: ['react', 'typescript', 'frontend', 'dashboard']
  },
  {
    originalName: 'sentiment_analyzer.py',
    projectName: 'Social Media Sentiment Analysis',
    description: 'An NLP pipeline for analyzing sentiment of social media posts using scikit-learn with TF-IDF vectorization and Naive Bayes classification.',
    content: `import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score

class SentimentAnalyzer:
    """
    A sentiment analysis engine that classifies text into
    positive, negative, or neutral categories using a
    TF-IDF + Naive Bayes pipeline.
    """
    
    def __init__(self):
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(
                max_features=10000,
                ngram_range=(1, 2),
                stop_words='english',
                min_df=2
            )),
            ('classifier', MultinomialNB(alpha=0.1))
        ])
        self.label_map = {0: 'Negative', 1: 'Neutral', 2: 'Positive'}
    
    def preprocess(self, text):
        """Clean and normalize text for analysis."""
        text = text.lower()
        text = re.sub(r'http\\S+|www\\S+', '', text)
        text = re.sub(r'@\\w+', '', text)
        text = re.sub(r'#(\\w+)', r'\\1', text)
        text = re.sub(r'[^a-zA-Z\\s]', '', text)
        return text.strip()
    
    def train(self, texts, labels):
        """Train the sentiment model on labeled data."""
        cleaned = [self.preprocess(t) for t in texts]
        self.pipeline.fit(cleaned, labels)
        
        # Cross-validation for reliability
        scores = cross_val_score(self.pipeline, cleaned, labels, cv=5)
        print(f"Cross-val accuracy: {scores.mean():.3f} (+/- {scores.std():.3f})")
    
    def predict(self, text):
        """Predict sentiment for a single text input."""
        cleaned = self.preprocess(text)
        prediction = self.pipeline.predict([cleaned])[0]
        probabilities = self.pipeline.predict_proba([cleaned])[0]
        
        return {
            'sentiment': self.label_map[prediction],
            'confidence': float(max(probabilities)),
            'scores': {
                self.label_map[i]: float(p) 
                for i, p in enumerate(probabilities)
            }
        }

if __name__ == '__main__':
    analyzer = SentimentAnalyzer()
    sample_texts = [
        "I absolutely love this product, best purchase ever!",
        "The service was terrible and staff was rude",
        "It was an okay experience, nothing special"
    ]
    sample_labels = [2, 0, 1]
    analyzer.train(sample_texts, sample_labels)
    
    result = analyzer.predict("This university has amazing faculty!")
    print(f"Result: {result}")`,
    language: 'Python',
    tags: ['nlp', 'machine-learning', 'scikit-learn', 'sentiment-analysis']
  },
  {
    originalName: 'ChatServer.java',
    projectName: 'Campus Chat Application',
    description: 'A multithreaded chat server built with Java sockets for real-time communication between university students across departments.',
    content: `import java.io.*;
import java.net.*;
import java.util.*;
import java.util.concurrent.*;

/**
 * A multithreaded chat server that supports multiple
 * concurrent client connections. Each client runs in its
 * own thread, and messages are broadcast to all connected
 * users in the same chat room.
 */
public class ChatServer {
    private static final int PORT = 9090;
    private final Set<ClientHandler> activeClients = ConcurrentHashMap.newKeySet();
    private final Map<String, Set<ClientHandler>> chatRooms = new ConcurrentHashMap<>();

    public void start() throws IOException {
        ServerSocket serverSocket = new ServerSocket(PORT);
        System.out.println("Campus Chat Server started on port " + PORT);

        while (true) {
            Socket clientSocket = serverSocket.accept();
            ClientHandler handler = new ClientHandler(clientSocket);
            activeClients.add(handler);
            new Thread(handler).start();
        }
    }

    private void broadcastToRoom(String room, String message, ClientHandler sender) {
        Set<ClientHandler> members = chatRooms.getOrDefault(room, Collections.emptySet());
        for (ClientHandler client : members) {
            if (client != sender) {
                client.sendMessage(message);
            }
        }
    }

    private class ClientHandler implements Runnable {
        private final Socket socket;
        private PrintWriter output;
        private String username;
        private String currentRoom;

        ClientHandler(Socket socket) {
            this.socket = socket;
        }

        @Override
        public void run() {
            try {
                BufferedReader input = new BufferedReader(
                    new InputStreamReader(socket.getInputStream()));
                output = new PrintWriter(socket.getOutputStream(), true);

                output.println("Enter your username:");
                username = input.readLine();
                output.println("Welcome, " + username + "! Type /join <room> to enter a chat room.");

                String message;
                while ((message = input.readLine()) != null) {
                    if (message.startsWith("/join ")) {
                        joinRoom(message.substring(6).trim());
                    } else if (message.equals("/quit")) {
                        break;
                    } else if (currentRoom != null) {
                        broadcastToRoom(currentRoom, 
                            "[" + username + "]: " + message, this);
                    }
                }
            } catch (IOException e) {
                System.err.println("Client disconnected: " + username);
            } finally {
                cleanup();
            }
        }

        void joinRoom(String room) {
            if (currentRoom != null) {
                chatRooms.get(currentRoom).remove(this);
            }
            currentRoom = room;
            chatRooms.computeIfAbsent(room, k -> ConcurrentHashMap.newKeySet()).add(this);
            output.println("Joined room: " + room);
        }

        void sendMessage(String message) {
            output.println(message);
        }

        void cleanup() {
            activeClients.remove(this);
            if (currentRoom != null) {
                chatRooms.getOrDefault(currentRoom, Collections.emptySet()).remove(this);
            }
            try { socket.close(); } catch (IOException ignored) {}
        }
    }

    public static void main(String[] args) throws IOException {
        new ChatServer().start();
    }
}`,
    language: 'Java',
    tags: ['java', 'networking', 'multithreading', 'chat']
  },
  {
    originalName: 'expense_tracker.py',
    projectName: 'Student Expense Tracker',
    description: 'A Flask-based REST API for tracking student expenses with category-wise analytics and monthly budget alerts.',
    content: `from flask import Flask, request, jsonify
from datetime import datetime, timedelta
from collections import defaultdict

app = Flask(__name__)

# In-memory storage (would use SQLAlchemy in production)
expenses_db = []
budgets_db = {}

class ExpenseManager:
    """Manages student expenses with category tracking and budget alerts."""
    
    CATEGORIES = [
        'Food', 'Transport', 'Books', 'Entertainment', 
        'Hostel', 'Laundry', 'Stationery', 'Other'
    ]
    
    @staticmethod
    def add_expense(student_id, amount, category, description=''):
        if category not in ExpenseManager.CATEGORIES:
            raise ValueError(f"Invalid category. Choose from: {ExpenseManager.CATEGORIES}")
        
        expense = {
            'id': len(expenses_db) + 1,
            'student_id': student_id,
            'amount': float(amount),
            'category': category,
            'description': description,
            'timestamp': datetime.now().isoformat()
        }
        expenses_db.append(expense)
        return expense
    
    @staticmethod
    def get_monthly_summary(student_id, year, month):
        monthly = [e for e in expenses_db 
                   if e['student_id'] == student_id 
                   and datetime.fromisoformat(e['timestamp']).year == year
                   and datetime.fromisoformat(e['timestamp']).month == month]
        
        category_totals = defaultdict(float)
        for expense in monthly:
            category_totals[expense['category']] += expense['amount']
        
        total_spent = sum(category_totals.values())
        budget = budgets_db.get(student_id, 5000)
        
        return {
            'total_spent': total_spent,
            'budget': budget,
            'remaining': budget - total_spent,
            'over_budget': total_spent > budget,
            'breakdown': dict(category_totals),
            'transaction_count': len(monthly)
        }

@app.route('/api/expenses', methods=['POST'])
def create_expense():
    data = request.json
    try:
        expense = ExpenseManager.add_expense(
            data['student_id'], data['amount'],
            data['category'], data.get('description', '')
        )
        return jsonify({'success': True, 'expense': expense}), 201
    except (KeyError, ValueError) as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/expenses/summary/<student_id>', methods=['GET'])
def monthly_summary(student_id):
    now = datetime.now()
    year = int(request.args.get('year', now.year))
    month = int(request.args.get('month', now.month))
    summary = ExpenseManager.get_monthly_summary(student_id, year, month)
    return jsonify({'success': True, 'summary': summary})

if __name__ == '__main__':
    app.run(debug=True, port=5001)`,
    language: 'Python',
    tags: ['flask', 'rest-api', 'finance', 'student-tools']
  },
  {
    originalName: 'useDebounce.ts',
    projectName: 'Library Management System',
    description: 'A collection of custom React hooks for a university library management system including debounced search and infinite scroll.',
    content: `import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook that debounces a value by a specified delay.
 * Useful for search inputs to prevent excessive API calls.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for infinite scrolling with intersection observer.
 * Triggers a callback when the sentinel element enters the viewport.
 */
export function useInfiniteScroll(
  callback: () => void,
  options?: IntersectionObserverInit
) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) callback();
      },
      { threshold: 0.1, ...options }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [callback, options]);

  return sentinelRef;
}

/**
 * Custom hook for book search with pagination.
 * Combines debouncing with paginated API calls.
 */
interface Book {
  isbn: string;
  title: string;
  author: string;
  available: boolean;
}

interface UseBookSearchReturn {
  books: Book[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
}

export function useBookSearch(query: string): UseBookSearchReturn {
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    setBooks([]);
    setPage(1);
    setHasMore(true);
  }, [debouncedQuery]);

  useEffect(() => {
    if (!debouncedQuery) return;
    
    const fetchBooks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          \`/api/library/search?q=\${encodeURIComponent(debouncedQuery)}&page=\${page}&limit=20\`
        );
        const data = await res.json();
        
        setBooks(prev => page === 1 ? data.books : [...prev, ...data.books]);
        setHasMore(data.books.length === 20);
      } catch (err) {
        setError('Failed to search books');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [debouncedQuery, page]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) setPage(p => p + 1);
  }, [isLoading, hasMore]);

  return { books, isLoading, error, hasMore, loadMore };
}`,
    language: 'TypeScript',
    tags: ['react', 'hooks', 'typescript', 'library-system']
  },
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected for Repositories Seed');

    // Create uploads dir if not exists
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    // Drop repositories
    try { await mongoose.connection.db.dropCollection('repositories'); } catch(e) {}
    // Drop ONLY demo users to not delete real user accounts
    await User.deleteMany({ username: { $regex: /^student_/i } });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    let totalRepos = 0;

    for (let i = 0; i < SEED_UNIVERSITIES.length; i++) {
      const uni = SEED_UNIVERSITIES[i];
      const citySafe = uni.city.toLowerCase().replace(/\s+/g, '');
      
      // Create a student for this university
      const student = await User.create({
        username: `student_${citySafe}_${i}`,
        email: `student${i}@${citySafe}.edu`,
        password: hashedPassword,
        name: `Student from ${uni.name.substring(0, 20)}`,
        university: uni.name,
      });

      // Assign 2-3 random snippets per university for variety
      const snippetCount = 2 + Math.floor(Math.random() * 2); // 2 or 3
      const shuffled = [...CODE_SNIPPETS].sort(() => 0.5 - Math.random());
      const selectedSnippets = shuffled.slice(0, snippetCount);

      for (let j = 0; j < selectedSnippets.length; j++) {
        const snippet = selectedSnippets[j];
        
        // Write file physical representation
        const storedName = `seed_${Date.now()}_${Math.random().toString(36).substring(7)}.txt`;
        const filePath = path.join(UPLOADS_DIR, storedName);
        fs.writeFileSync(filePath, snippet.content);

        await Repository.create({
          name: `${snippet.projectName} - ${uni.name.split(' ').slice(0, 3).join(' ')}`,
          description: snippet.description,
          isPublic: true,
          tags: snippet.tags,
          owner: student._id,
          university: uni.name,
          language: snippet.language,
          files: [{
            originalName: snippet.originalName,
            storedName: storedName,
            path: filePath,
            size: Buffer.byteLength(snippet.content, 'utf8'),
            mimetype: 'text/plain',
            content: snippet.content
          }]
        });
        totalRepos++;
      }
    }

    console.log(`✅ ${totalRepos} Real File Repositories Imported Across ${SEED_UNIVERSITIES.length} Universities`);
    process.exit();
  } catch (error) {
    console.error('❌ Error with data import', error);
    process.exit(1);
  }
};

importData();
