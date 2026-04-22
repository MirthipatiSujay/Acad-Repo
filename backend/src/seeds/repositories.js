const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Repository = require('../models/Repository');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Real code snippets to make the plagiarism detection functional
const CODE_SNIPPETS = [
  {
    originalName: 'auth.js',
    content: `const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access Denied' });
  try {
    const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid Token' });
  }
};`,
    language: 'JavaScript',
    tags: ['nodejs', 'auth', 'jwt']
  },
  {
    originalName: 'model.py',
    content: `import tensorflow as tf
from tensorflow.keras import layers, models

def create_cnn():
    model = models.Sequential()
    model.add(layers.Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)))
    model.add(layers.MaxPooling2D((2, 2)))
    model.add(layers.Conv2D(64, (3, 3), activation='relu'))
    model.add(layers.MaxPooling2D((2, 2)))
    model.add(layers.Flatten())
    model.add(layers.Dense(64, activation='relu'))
    model.add(layers.Dense(10, activation='softmax'))
    return model`,
    language: 'Python',
    tags: ['machine-learning', 'cnn', 'tensorflow']
  },
  {
    originalName: 'Main.java',
    content: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter a number:");
        int n = sc.nextInt();
        int[] dp = new int[n + 1];
        dp[0] = 0;
        if (n > 0) dp[1] = 1;
        for (int i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];
        System.out.println("Fibonacci: " + dp[n]);
    }
}`,
    language: 'Java',
    tags: ['java', 'algorithms', 'dynamic-programming']
  },
  {
    originalName: 'Button.tsx',
    content: `import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  const baseClass = "px-4 py-2 rounded font-medium transition-colors ";
  const variantClass = variant === 'primary' ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-800 hover:bg-gray-300";
  return (
    <button className={baseClass + variantClass} onClick={onClick}>
      {label}
    </button>
  );
};`,
    language: 'TypeScript',
    tags: ['react', 'frontend', 'ui-components']
  }
];

// Hardcoded universities for seeding as we move away from ObjectId references
const SEED_UNIVERSITIES = [
  { name: 'Lovely Professional University', city: 'Phagwara' }
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
        name: `Student from ${uni.name.substring(0, 10)}`,
        university: uni.name,
      });

      // Pick all snippets for this university to have more data
      for (let j = 0; j < CODE_SNIPPETS.length; j++) {
        const snippet = CODE_SNIPPETS[j];
        
        // Write file physical representation
        const storedName = `seed_${Date.now()}_${Math.random().toString(36).substring(7)}.txt`;
        const filePath = path.join(UPLOADS_DIR, storedName);
        fs.writeFileSync(filePath, snippet.content);

        await Repository.create({
          name: `${snippet.originalName.split('.')[0]} Project ${j+1}`,
          description: `A capstone submission from ${uni.name} focused on ${snippet.tags[0]}.`,
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
            mimetype: 'text/plain'
          }]
        });
        totalRepos++;
      }
    }

    console.log(`✅ ${totalRepos} Real File Repositories Imported Across ${SEED_UNIVERSITIES.length} University`);
    process.exit();
  } catch (error) {
    console.error('❌ Error with data import', error);
    process.exit(1);
  }
};

importData();
