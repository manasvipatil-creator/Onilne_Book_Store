import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Newspaper,
  GraduationCap,
  Cpu,
  Briefcase,
  Lightbulb,
  User,
  Landmark,
  Baby,
  Trophy,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  variant?: 'card' | 'chip';
  count?: number;
}

// Map slug/name to distinctive Lucide icon
export const getCategoryIcon = (slugOrName: string) => {
  const key = slugOrName.toLowerCase().replace(/[^a-z0-9]/g, '-');

  if (key.includes('non-fiction') || key.includes('news')) return Newspaper;
  if (key.includes('fiction')) return BookOpen;
  if (key.includes('tech') || key.includes('code') || key.includes('software')) return Cpu;
  if (key.includes('business') || key.includes('finance') || key.includes('money')) return Briefcase;
  if (key.includes('self-help') || key.includes('mindset') || key.includes('growth')) return Lightbulb;
  if (key.includes('biography') || key.includes('autobiography') || key.includes('memoir')) return User;
  if (key.includes('history') || key.includes('heritage')) return Landmark;
  if (key.includes('child') || key.includes('kid') || key.includes('baby')) return Baby;
  if (key.includes('exam') || key.includes('competition') || key.includes('test')) return Trophy;
  if (key.includes('educat') || key.includes('academic') || key.includes('study')) return GraduationCap;

  return BookOpen;
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  variant = 'card',
  count,
}) => {
  const IconComponent = getCategoryIcon(category.slug || category.name);

  if (variant === 'chip') {
    return (
      <Link
        to={`/categories/${category.slug || category._id}`}
        className="group inline-flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl bg-surface border border-borderMuted hover:border-golden/40 hover:bg-navy/5 transition-all duration-200 shadow-soft hover:shadow-md flex-shrink-0"
      >
        <div className="w-7 h-7 rounded-lg bg-navy/5 text-navy group-hover:bg-navy group-hover:text-golden flex items-center justify-center transition-colors">
          <IconComponent className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
        </div>
        <span className="text-xs sm:text-sm font-semibold text-navy group-hover:text-navy transition-colors whitespace-nowrap">
          {category.name}
        </span>
        {count !== undefined && (
          <span className="text-[10px] text-textSecondary font-bold px-1.5 py-0.5 rounded-full bg-slate-100">
            {count}
          </span>
        )}
      </Link>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link
        to={`/categories/${category.slug || category._id}`}
        className="group relative flex flex-col justify-between h-full p-5 rounded-2xl bg-surface border border-borderMuted hover:border-navy/20 shadow-soft hover:shadow-elevated transition-all duration-300 overflow-hidden"
      >
        {/* If category has an image, render subtle thumbnail backdrop */}
        {category.image && (
          <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
          </div>
        )}

        <div className="relative z-10">
          {/* Icon tile */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy to-navy-light text-golden flex items-center justify-center mb-4 shadow-soft group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
            <IconComponent className="w-6 h-6" />
          </div>

          <h3 className="font-serif font-bold text-navy text-lg group-hover:text-golden transition-colors line-clamp-1 mb-1.5">
            {category.name}
          </h3>

          <p className="text-xs text-textSecondary line-clamp-2 leading-relaxed">
            {category.description || 'Explore curated literary masterpieces and bestsellers.'}
          </p>
        </div>

        <div className="relative z-10 pt-4 mt-auto flex items-center justify-between text-xs font-bold text-navy group-hover:text-golden border-t border-borderMuted/60 transition-colors">
          <span>Explore Genre</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </Link>
    </motion.div>
  );
};
