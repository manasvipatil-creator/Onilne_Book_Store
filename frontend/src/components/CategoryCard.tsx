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
  Heart,
  Grid,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  variant?: 'card' | 'chip';
  count?: number;
}

export const getCategoryIcon = (slugOrName: string) => {
  const key = slugOrName.toLowerCase().replace(/[^a-z0-9]/g, '-');

  if (key.includes('health') || key.includes('wellness') || key.includes('fitness')) return Heart;
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
        className="group inline-flex items-center space-x-2 px-3.5 py-2 rounded-full bg-surface border border-borderMuted hover:border-golden/40 hover:bg-golden/5 transition-all duration-200 shadow-xs flex-shrink-0"
      >
        <div className="w-6 h-6 rounded-full bg-golden/10 text-golden group-hover:bg-golden group-hover:text-navy flex items-center justify-center transition-colors">
          <IconComponent className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-semibold text-navy whitespace-nowrap">
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

  // BOOKORA Signature Category Card: Soft cream/beige surface, prominent dark navy icon, clean serif name
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }} className="h-full">
      <Link
        to={`/categories/${category.slug || category._id}`}
        className="group flex flex-col items-center justify-center text-center p-3.5 sm:p-4 rounded-2xl bg-[#FFF9F2] hover:bg-[#FFF3E3] border border-amber-100/80 hover:border-golden/40 shadow-xs hover:shadow-soft transition-all duration-300 h-full"
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-amber-200/50 text-navy group-hover:text-golden group-hover:border-golden/50 flex items-center justify-center mb-2.5 shadow-xs group-hover:scale-105 transition-all">
          <IconComponent className="w-6 h-6 transition-colors" />
        </div>
        <span className="font-serif font-bold text-xs sm:text-sm text-navy group-hover:text-golden-dark transition-colors line-clamp-1">
          {category.name}
        </span>
      </Link>
    </motion.div>
  );
};
