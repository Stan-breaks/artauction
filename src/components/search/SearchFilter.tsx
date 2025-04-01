import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FilterOptions = {
  medium?: string;
  minYear?: string;
  maxYear?: string;
  tags?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
};

type SearchFilterProps = {
  onSearch: (query: string, filters: FilterOptions) => void;
  availableTags?: string[];
  availableMediums?: string[];
};

export default function SearchFilter({
  onSearch,
  availableTags = [],
  availableMediums = []
}: SearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({});
  const [query, setQuery] = useState('');
  const [formValues, setFormValues] = useState({
    medium: '',
    minYear: '',
    maxYear: '',
    minPrice: '',
    maxPrice: ''
  });
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  const handleReset = () => {
    setQuery('');
    setFormValues({
      medium: '',
      minYear: '',
      maxYear: '',
      minPrice: '',
      maxPrice: ''
    });
    setSelectedTags([]);
    setActiveFilters({});
    onSearch('', {});
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filters: FilterOptions = {};
    
    if (formValues.medium) filters.medium = formValues.medium;
    if (formValues.minYear) filters.minYear = formValues.minYear;
    if (formValues.maxYear) filters.maxYear = formValues.maxYear;
    if (selectedTags.length > 0) filters.tags = selectedTags;
    
    if (formValues.minPrice || formValues.maxPrice) {
      filters.priceRange = {};
      if (formValues.minPrice) filters.priceRange.min = parseFloat(formValues.minPrice);
      if (formValues.maxPrice) filters.priceRange.max = parseFloat(formValues.maxPrice);
    }
    
    setActiveFilters(filters);
    onSearch(query, filters);
  };
  
  // Count active filters
  const activeFilterCount = Object.keys(activeFilters).reduce((count, key) => {
    if (key === 'tags' && Array.isArray(activeFilters.tags)) {
      return count + activeFilters.tags.length;
    }
    if (key === 'priceRange') {
      const priceRange = activeFilters.priceRange || {};
      return count + (priceRange.min ? 1 : 0) + (priceRange.max ? 1 : 0);
    }
    return count + 1;
  }, 0);
  
  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search artworks, artists, or styles..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#078250] focus:border-[#078250]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button
            type="button"
            onClick={toggleFilters}
            variant={showFilters ? "default" : "outline"}
            className={showFilters ? "bg-[#078250] hover:bg-[#078250]/90" : ""}
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-[#b65425] rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Button
            type="submit"
            className="bg-[#078250] hover:bg-[#078250]/90 text-white"
          >
            Search
          </Button>
          {(query || activeFilterCount > 0) && (
            <Button
              type="button"
              onClick={handleReset}
              variant="outline"
              className="flex items-center"
            >
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-md">
            {/* Medium Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Medium</label>
              <select
                className="w-full rounded-md border-gray-300 focus:border-[#078250] focus:ring focus:ring-[#078250] focus:ring-opacity-50"
                name="medium"
                value={formValues.medium}
                onChange={handleChange}
              >
                <option value="">Any Medium</option>
                {availableMediums.map(medium => (
                  <option key={medium} value={medium}>
                    {medium}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Year Range */}
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="From"
                  className="w-full rounded-md border-gray-300 focus:border-[#078250] focus:ring focus:ring-[#078250] focus:ring-opacity-50"
                  name="minYear"
                  value={formValues.minYear}
                  onChange={handleChange}
                />
                <input
                  type="number"
                  placeholder="To"
                  className="w-full rounded-md border-gray-300 focus:border-[#078250] focus:ring focus:ring-[#078250] focus:ring-opacity-50"
                  name="maxYear"
                  value={formValues.maxYear}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-1">Price Range (KES)</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full rounded-md border-gray-300 focus:border-[#078250] focus:ring focus:ring-[#078250] focus:ring-opacity-50"
                  name="minPrice"
                  value={formValues.minPrice}
                  onChange={handleChange}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full rounded-md border-gray-300 focus:border-[#078250] focus:ring focus:ring-[#078250] focus:ring-opacity-50"
                  name="maxPrice"
                  value={formValues.maxPrice}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {/* Tags */}
            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedTags.includes(tag)
                        ? 'bg-[#078250]/20 text-[#078250] border border-[#078250]'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>
      
      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="mt-4">
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2">Active Filters:</span>
            <button
              onClick={handleReset}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {activeFilters.medium && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Medium: {activeFilters.medium}
              </span>
            )}
            {activeFilters.minYear && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                From Year: {activeFilters.minYear}
              </span>
            )}
            {activeFilters.maxYear && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                To Year: {activeFilters.maxYear}
              </span>
            )}
            {activeFilters.priceRange?.min && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Min Price: ${activeFilters.priceRange.min}
              </span>
            )}
            {activeFilters.priceRange?.max && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Max Price: ${activeFilters.priceRange.max}
              </span>
            )}
            {activeFilters.tags &&
              activeFilters.tags.map(tag => (
                <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Tag: {tag}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
} 