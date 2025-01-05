import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false
  },
  slug: {
    type: String,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true 
});

// Slug oluşturma middleware
categorySchema.pre('save', function(next) {
  if (this.name) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      locale: 'tr'
    });
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;