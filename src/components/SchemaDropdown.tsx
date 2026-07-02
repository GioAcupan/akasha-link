import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { ChevronDown, ChevronUp, Search, Check } from 'lucide-react-native';
import { useAppStore } from '../store';

interface SearchableDropdownProps {
  items: any[];
  selectedId: string;
  onSelect: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
}

const SearchableDropdown = ({ items, selectedId, onSelect, placeholder, disabled }: SearchableDropdownProps) => {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');

  const selectedItem = items.find(i => (i.id || i) === selectedId);
  const selectedLabel = selectedItem ? (selectedItem.label || selectedItem.id || selectedItem) : '';

  const filteredItems = items.filter(i => {
    const label = (i.label || i.id || i).toLowerCase();
    return label.includes(search.toLowerCase());
  });

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity 
        style={[styles.dropdownHeader, disabled && styles.dropdownHeaderDisabled]} 
        onPress={() => !disabled && setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownHeaderText, !selectedId && { color: '#94A3B8' }]}>
          {selectedId ? selectedLabel : placeholder}
        </Text>
        {expanded ? <ChevronUp size={20} color="#64748B" /> : <ChevronDown size={20} color="#64748B" />}
      </TouchableOpacity>

      {expanded && !disabled && (
        <View style={styles.dropdownBody}>
          <View style={styles.searchRow}>
            <Search size={16} color="#94A3B8" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <ScrollView style={styles.dropdownList} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
            {filteredItems.map(item => {
              const id = item.id || item;
              const label = item.label || id;
              const isSelected = selectedId === id;
              return (
                <TouchableOpacity 
                  key={id}
                  style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                  onPress={() => {
                    onSelect(id);
                    setExpanded(false);
                    setSearch('');
                  }}
                >
                  <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>
                    {label}
                  </Text>
                  {isSelected && <Check size={16} color="#0F172A" />}
                </TouchableOpacity>
              );
            })}
            {filteredItems.length === 0 && (
              <Text style={styles.noResultsText}>No results found</Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

interface SchemaDropdownProps {
  onSelect?: (domainId: string, mocId: string) => void;
}

export const SchemaDropdown = ({ onSelect }: SchemaDropdownProps) => {
  const { schema, isSchemaLoading, schemaError, loadSchema, useMockSchema } = useAppStore();
  const [selectedDomainId, setSelectedDomainId] = useState<string>('');
  const [selectedMocId, setSelectedMocId] = useState<string>('');

  useEffect(() => {
    if (onSelect) {
      onSelect(selectedDomainId, selectedMocId);
    }
  }, [selectedDomainId, selectedMocId]);

  if (isSchemaLoading) {
    return <Text style={styles.loadingText}>Loading Schema...</Text>;
  }

  if (schemaError || !schema) {
    return (
      <View style={styles.errorContainer}>
        <Text style={schemaError ? styles.errorText : styles.loadingText}>
          {schemaError ? `Error: ${schemaError}` : 'Schema not loaded yet.'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSchema}>
          <Text style={styles.retryButtonText}>{schemaError ? 'Retry Load' : 'Load Schema'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mockButton} onPress={useMockSchema}>
          <Text style={styles.mockButtonText}>Use Mock Schema</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const domains = schema.domains || [];
  const selectedDomainObj = domains.find((d: any) => d.id === selectedDomainId);
  const mocs = selectedDomainObj?.mocs || [];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Domain</Text>
      <SearchableDropdown 
        items={domains}
        selectedId={selectedDomainId}
        onSelect={(id) => {
          setSelectedDomainId(id);
          setSelectedMocId(''); // reset MOC when domain changes
        }}
        placeholder="Select a domain..."
      />

      <Text style={styles.label}>MOC</Text>
      <SearchableDropdown 
        items={mocs}
        selectedId={selectedMocId}
        onSelect={setSelectedMocId}
        placeholder={selectedDomainId ? "Select a MOC..." : "Select a domain first"}
        disabled={!selectedDomainId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    marginTop: 4,
  },
  dropdownContainer: {
    marginBottom: 16,
    zIndex: 10, // helps with nested dropdowns if they were absolute, but these are inline
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownHeaderDisabled: {
    backgroundColor: '#F1F5F9',
    opacity: 0.6,
  },
  dropdownHeaderText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  dropdownBody: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 15,
    color: '#0F172A',
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  dropdownItemSelected: {
    backgroundColor: '#F1F5F9',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#334155',
  },
  dropdownItemTextSelected: {
    color: '#0F172A',
    fontWeight: '600',
  },
  noResultsText: {
    padding: 16,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 10,
  },
  loadingText: {
    color: '#64748B',
  },
  errorText: {
    color: '#E11D48',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mockButton: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  mockButtonText: {
    color: '#475569',
    fontWeight: '600',
  }
});
