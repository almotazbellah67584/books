import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, DataTable, TextInput } from 'react-native-paper';
import { dataStore } from '../store/dataStore';
import { Book } from '../types';

const InventoryScreen = () => {
  const [books, setBooks] = useState<Book[]>(dataStore.getBooks());
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(dataStore.getBooks());
  const [newBook, setNewBook] = useState<Omit<Book, 'id'>>({ 
    name: '', 
    quantity: 0, 
    pricePerUnit: 0,
    totalCost: 0
  });
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = dataStore.subscribe(() => {
      const allBooks = dataStore.getBooks();
      setBooks(allBooks);
      setFilteredBooks(allBooks);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = books.filter(book =>
        book.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(books);
    }
  }, [searchQuery, books]);

  const handleAddBook = async () => {
    if (!newBook.name || newBook.quantity <= 0 || newBook.pricePerUnit <= 0) {
      Alert.alert('خطأ', 'الرجاء تعبئة جميع الحقول بقيم صحيحة');
      return;
    }

    const book: Book = {
      ...newBook,
      id: Date.now().toString(),
      totalCost: newBook.quantity * newBook.pricePerUnit
    };

    const success = await dataStore.addBook(book);
    if (success) {
      setNewBook({ name: '', quantity: 0, pricePerUnit: 0, totalCost: 0 });
      Alert.alert('نجاح', 'تمت إضافة الكتاب بنجاح');
    } else {
      Alert.alert('خطأ', 'فشل في إضافة الكتاب');
    }
  };

  const handleUpdateBook = async () => {
    if (!editingBook) return;

    const updatedBook = {
      ...editingBook,
      totalCost: editingBook.quantity * editingBook.pricePerUnit
    };

    const success = await dataStore.addBook(updatedBook);
    if (success) {
      setEditingBook(null);
      Alert.alert('نجاح', 'تم تحديث الكتاب بنجاح');
    } else {
      Alert.alert('خطأ', 'فشل في تحديث الكتاب');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.formCard}>
        <Card.Title title={editingBook ? 'تعديل كتاب' : 'إضافة كتاب جديد'} />
        <Card.Content>
          <TextInput
            label="اسم الكتاب"
            value={editingBook ? editingBook.name : newBook.name}
            onChangeText={(text) => 
              editingBook 
                ? setEditingBook({...editingBook, name: text}) 
                : setNewBook({...newBook, name: text})
            }
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="الكمية"
            value={editingBook ? editingBook.quantity.toString() : newBook.quantity.toString()}
            onChangeText={(text) => {
              const quantity = parseInt(text) || 0;
              editingBook 
                ? setEditingBook({...editingBook, quantity}) 
                : setNewBook({...newBook, quantity})
            }}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />
          <TextInput
            label="السعر لكل وحدة"
            value={editingBook ? editingBook.pricePerUnit.toString() : newBook.pricePerUnit.toString()}
            onChangeText={(text) => {
              const price = parseFloat(text) || 0;
              editingBook 
                ? setEditingBook({...editingBook, pricePerUnit: price}) 
                : setNewBook({...newBook, pricePerUnit: price})
            }}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />
          {editingBook ? (
            <Button
              mode="contained"
              onPress={handleUpdateBook}
              style={styles.button}
            >
              تحديث الكتاب
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleAddBook}
              style={styles.button}
            >
              إضافة كتاب
            </Button>
          )}
          {editingBook && (
            <Button
              mode="outlined"
              onPress={() => setEditingBook(null)}
              style={styles.button}
            >
              إلغاء
            </Button>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.tableCard}>
        <Card.Title title="المخزون" />
        <Card.Content>
          <TextInput
            label="ابحث عن كتاب"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            mode="outlined"
            left={<TextInput.Icon icon="magnify" />}
          />
          
          {filteredBooks.length === 0 ? (
            <Text style={styles.emptyText}>
              {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد كتب في المخزون'}
            </Text>
          ) : (
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>الاسم</DataTable.Title>
                <DataTable.Title numeric>الكمية</DataTable.Title>
                <DataTable.Title numeric>السعر</DataTable.Title>
                <DataTable.Title>تعديل</DataTable.Title>
              </DataTable.Header>

              {filteredBooks.map((book) => (
                <DataTable.Row key={book.id}>
                  <DataTable.Cell>{book.name}</DataTable.Cell>
                  <DataTable.Cell numeric>{book.quantity}</DataTable.Cell>
                  <DataTable.Cell numeric>{book.pricePerUnit.toFixed(2)}</DataTable.Cell>
                  <DataTable.Cell>
                    <Button 
                      icon="pencil" 
                      onPress={() => {
                        setEditingBook(book);
                        setSearchQuery('');
                      }}
                      compact
                    >""</Button>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    marginBottom: 16,
  },
  tableCard: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  searchInput: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
    fontStyle: 'italic',
  },
});

export default InventoryScreen;