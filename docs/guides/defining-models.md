# How to Create a Model

We use a custom `FirebaseModel` wrapper that feels just like Mongoose. This gives us structure and validation in a NoSQL world.

## The "Functional" Model Pattern

We prefer instantiating models directly rather than extending classes. It's cleaner and simpler.

### 1. Define the Schema

We use Mongoose-style objects to define our data structure.

```javascript
const blogSchema = {
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5
    },
    views: {
        type: Number,
        default: 0
    },
    tags: {
        type: Array, // Strings inside array
        default: []
    },
    author: {
        type: Object, // Nested object
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    publishedAt: {
        type: Date,
        default: () => new Date()
    }
};
```

### 2. Create the Model

Import `FirebaseModel` and instantiate it with your collection name.

```javascript
import FirebaseModel from '../utils/firebaseModel.js';

// 'blogs' is the collection name in Firestore
const Blog = new FirebaseModel('blogs', blogSchema);

export default Blog;
```

### 3. Add Custom Methods (Optional)

If you need a specific query, attach a function to the instance.

```javascript
Blog.findPopular = async function() {
    // 'this' refers to the model instance
    return this.find({ isPopular: true });
};
```

---

## Available Data Types & Options

| Type | Description |
| :--- | :--- |
| `String` | Text. Options: `trim`, `lowercase`, `uppercase`, `enum` (allowed values). |
| `Number` | Integers or floats. Options: `min`, `max`. |
| `Boolean` | `true` or `false`. |
| `Date` | Date objects. |
| `Array` | Lists. |
| `Object` | Nested structures. |

### Common Options
- `required: true` - Field must exist.
- `default: value` - Value to use if missing. Can be a function `() => new Date()`.
- `validate: function(v)` - Custom validation function returning true/false.
- `match: RegExp` - Regex for string format validation.