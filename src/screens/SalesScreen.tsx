import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Card, TextInput, Button, DataTable, Menu, Divider, ToggleButton } from 'react-native-paper';
import { dataStore } from '../store/dataStore';
import { Sale, Book } from '../types';

export default function SalesScreen() {
  const [formData, setFormData] = useState({
    customerName: '',
    bookName: '',
    quantity: '1',
    wholesalePrice: '',
    sellingPrice: '',
  });

  const [sales, setSales] = useState<Sale[]>(dataStore.getSales());
  const [pendingSales, setPendingSales] = useState<Sale[]>(dataStore.getSales().filter(s => !s.completed));
  const [completedSales, setCompletedSales] = useState<Sale[]>(dataStore.getSales().filter(s => s.completed));
  const [showForm, setShowForm] = useState(false);
  const [books, setBooks] = useState<Book[]>(dataStore.getBooks());
  const [menuVisible, setMenuVisible] = useState(false);
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [viewMode, setViewMode] = useState<'pending' | 'completed'>('pending');
  const [actionMenuVisible, setActionMenuVisible] = useState<string | null>(null);

  useEffect(() => {
    const available = dataStore.getBooks().filter(book => book.quantity > 0);
    setAvailableBooks(available);
    setBooks(dataStore.getBooks());
    setPendingSales(dataStore.getSales().filter(s => !s.completed));
    setCompletedSales(dataStore.getSales().filter(s => s.completed));
  }, [sales]);

  const checkStockAvailability = (sale: Sale): boolean => {
    const book = books.find(b => b.id === sale.bookId);
    if (!book) return false;
    return book.quantity >= sale.quantity;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'quantity' && selectedBook) {
      const quantity = parseInt(value) || 0;
      if (quantity > selectedBook.quantity) {
        Alert.alert('خطأ', 'الكمية المطلوبة غير متوفرة في المخزون');
      }
    }
  };

  const calculateTotals = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const wholesalePrice = parseFloat(formData.wholesalePrice) || 0;
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    
    const totalCost = quantity * wholesalePrice;
    const totalRevenue = quantity * sellingPrice;
    const profit = totalRevenue - totalCost;
    
    return { totalCost, totalRevenue, profit };
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setFormData(prev => ({
      ...prev,
      bookName: book.name,
      wholesalePrice: book.pricePerUnit.toString(),
    }));
    setMenuVisible(false);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.customerName || !selectedBook || !formData.quantity) {
        Alert.alert('خطأ', 'يرجى تعبئة جميع الحقول المطلوبة');
        return;
      }

      const quantity = parseInt(formData.quantity);
      
      if (quantity <= 0) {
        Alert.alert('خطأ', 'الكمية يجب أن تكون أكبر من الصفر');
        return;
      }

      if (quantity > selectedBook.quantity) {
        Alert.alert('خطأ', 'الكمية المطلوبة غير متوفرة في المخزون');
        return;
      }

      const { totalCost, profit } = calculateTotals();
      
      const newSale: Sale = {
        id: Date.now().toString(),
        customerName: formData.customerName,
        bookName: selectedBook.name,
        bookId: selectedBook.id,
        quantity: quantity,
        wholesalePrice: selectedBook.pricePerUnit,
        sellingPrice: parseFloat(formData.sellingPrice),
        totalCost,
        profit,
        date: new Date().toISOString(),
        completed: false
      };

      await dataStore.addSale(newSale);
      setSales([...dataStore.getSales()]);
      
      setFormData({
        customerName: '',
        bookName: '',
        quantity: '1',
        wholesalePrice: '',
        sellingPrice: '',
      });
      setSelectedBook(null);
      
      Alert.alert('نجاح', 'تمت عملية البيع بنجاح');
      
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ المبيعة');
    }
  };

  const handleCompleteSale = async (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    if (!checkStockAvailability(sale)) {
      Alert.alert('خطأ', 'الكمية المطلوبة غير متوفرة في المخزون حالياً');
      return;
    }

    const updateSuccess = await dataStore.updateBookQuantity(sale.bookId, sale.quantity);
    if (!updateSuccess) {
      Alert.alert('خطأ', 'فشل في تحديث المخزون');
      return;
    }

    const updatedSales = sales.map(s => 
      s.id === saleId ? { ...s, completed: true } : s
    );
    await dataStore.setSales(updatedSales);
    await dataStore.saveData();
    
    setSales([...updatedSales]);
    Alert.alert('نجاح', 'تم إكمال الطلبية بنجاح');
  };

  const handleEditSale = (sale: Sale) => {
    if (!checkStockAvailability(sale)) {
      Alert.alert('تحذير', 'الكمية المطلوبة غير متوفرة في المخزون حالياً');
      return;
    }

    const book = books.find(b => b.id === sale.bookId);
    if (book) {
      setSelectedBook(book);
      setFormData({
        customerName: sale.customerName,
        bookName: sale.bookName,
        quantity: sale.quantity.toString(),
        wholesalePrice: sale.wholesalePrice.toString(),
        sellingPrice: sale.sellingPrice.toString(),
      });
      setShowForm(true);
    }
    setActionMenuVisible(null);
  };

  const handleDeleteSale = async (saleId: string) => {
    setActionMenuVisible(null);
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد أنك تريد حذف هذه المبيعة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            const updatedSales = sales.filter(s => s.id !== saleId);
            await dataStore.setSales(updatedSales);
            await dataStore.saveData();
            setSales([...updatedSales]);
            Alert.alert('نجاح', 'تم حذف المبيعة بنجاح');
          },
        },
      ]
    );
  };

  const { totalCost, totalRevenue, profit } = calculateTotals();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Button
          mode={showForm ? "outlined" : "contained"}
          onPress={() => setShowForm(!showForm)}
          style={styles.toggleButton}
          icon={showForm ? "close" : "plus"}
        >
          {showForm ? 'إلغاء' : 'إضافة مبيعة جديدة'}
        </Button>
        
        <View style={styles.toggleContainer}>
          <ToggleButton.Row 
            onValueChange={value => setViewMode(value as 'pending' | 'completed')} 
            value={viewMode}
          >
            <ToggleButton 
              icon="clock" 
              value="pending" 
              style={viewMode === 'pending' ? styles.activeToggle : styles.inactiveToggle}
            />
            <ToggleButton 
              icon="check" 
              value="completed" 
              style={viewMode === 'completed' ? styles.activeToggle : styles.inactiveToggle}
            />
          </ToggleButton.Row>
        </View>
      </View>

      {showForm && (
        <Card style={styles.formCard} elevation={3}>
          <Card.Title title="تسجيل مبيعة جديدة" />
          <Card.Content>
            <TextInput
              label="اسم العميل"
              value={formData.customerName}
              onChangeText={(value) => handleInputChange('customerName', value)}
              style={styles.input}
              mode="outlined"
            />

            <View style={styles.menuContainer}>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button 
                    onPress={() => setMenuVisible(true)}
                    mode="outlined"
                    style={styles.bookSelectButton}
                  >
                    {selectedBook ? selectedBook.name : 'اختر كتاب من المخزون'}
                  </Button>
                }
              >
                {availableBooks.length === 0 ? (
                  <Menu.Item title="لا توجد كتب متوفرة" />
                ) : (
                  availableBooks.map((book) => (
                    <Menu.Item
                      key={book.id}
                      title={`${book.name} (${book.quantity} متبقي)`}
                      onPress={() => handleSelectBook(book)}
                    />
                  ))
                )}
              </Menu>
            </View>

            <TextInput
              label="الكمية"
              value={formData.quantity}
              onChangeText={(value) => handleInputChange('quantity', value)}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
              disabled={!selectedBook}
            />

            {selectedBook && (
              <Text style={styles.availableQuantity}>
                الكمية المتوفرة: {selectedBook.quantity}
              </Text>
            )}

            <TextInput
              label="سعر الجملة (ريال)"
              value={formData.wholesalePrice}
              onChangeText={(value) => handleInputChange('wholesalePrice', value)}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
              disabled={true}
            />

            <TextInput
              label="سعر البيع (ريال)"
              value={formData.sellingPrice}
              onChangeText={(value) => handleInputChange('sellingPrice', value)}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
            />

            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text style={styles.summaryTitle}>ملخص العملية</Text>
                <View style={styles.summaryRow}>
                  <Text>التكلفة الإجمالية:</Text>
                  <Text style={styles.summaryValue}>{totalCost.toFixed(2)} ريال</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text>إجمالي البيع:</Text>
                  <Text style={styles.summaryValue}>{totalRevenue.toFixed(2)} ريال</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text>الربح:</Text>
                  <Text style={[styles.summaryValue, { color: profit >= 0 ? '#10b981' : '#dc2626' }]}>
                    {profit.toFixed(2)} ريال
                  </Text>
                </View>
              </Card.Content>
            </Card>

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              icon="content-save"
              disabled={!selectedBook}
            >
              حفظ المبيعة
            </Button>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.tableCard} elevation={3}>
        <Card.Title title={viewMode === 'pending' ? 'المبيعات غير المكتملة' : 'المبيعات المكتملة'} />
        <Card.Content>
          {(viewMode === 'pending' ? pendingSales : completedSales).length === 0 ? (
            <Text style={styles.emptyText}>
              {viewMode === 'pending' ? 'لا توجد مبيعات غير مكتملة' : 'لا توجد مبيعات مكتملة'}
            </Text>
          ) : (
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>العميل</DataTable.Title>
                <DataTable.Title>الكتاب</DataTable.Title>
                <DataTable.Title numeric>الكمية</DataTable.Title>
                <DataTable.Title numeric>الربح</DataTable.Title>
                {viewMode === 'pending' && <DataTable.Title>إجراءات</DataTable.Title>}
              </DataTable.Header>

              {(viewMode === 'pending' ? pendingSales : completedSales).slice(-10).reverse().map((sale) => (
                <DataTable.Row key={sale.id} style={!checkStockAvailability(sale) && viewMode === 'pending' ? styles.lowStockRow : null}>
                  <DataTable.Cell>{sale.customerName}</DataTable.Cell>
                  <DataTable.Cell>
                    {sale.bookName}
                    {!checkStockAvailability(sale) && viewMode === 'pending' && (
                      <Text style={styles.lowStockText}> (غير متوفر)</Text>
                    )}
                  </DataTable.Cell>
                  <DataTable.Cell numeric>{sale.quantity}</DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text style={{ color: sale.profit >= 0 ? '#10b981' : '#dc2626' }}>
                      {sale.profit.toFixed(2)}
                    </Text>
                  </DataTable.Cell>
                  {viewMode === 'pending' && (
                    <DataTable.Cell>
                      <View style={styles.actionsContainer}>
                        <Menu
                          visible={actionMenuVisible === sale.id}
                          onDismiss={() => setActionMenuVisible(null)}
                          anchor={
                            <Button 
                              icon="pencil" 
                              mode="text" 
                              onPress={() => setActionMenuVisible(sale.id)}
                              compact
                              disabled={!checkStockAvailability(sale)}
                            >""</Button>
                          }
                        >
                          <Menu.Item 
                            title="تعديل" 
                            onPress={() => handleEditSale(sale)}
                            leadingIcon="pencil"
                            disabled={!checkStockAvailability(sale)}
                          />
                          <Divider />
                          <Menu.Item 
                            title="حذف" 
                            onPress={() => handleDeleteSale(sale.id)}
                            leadingIcon="delete"
                            titleStyle={{ color: '#ef4444' }}
                          />
                        </Menu>
                        <Button 
                          icon="check" 
                          mode="text" 
                          onPress={() => handleCompleteSale(sale.id)}
                          compact
                          color="#10b981"
                          disabled={!checkStockAvailability(sale)}
                        >""</Button>
                      </View>
                    </DataTable.Cell>
                  )}
                </DataTable.Row>
              ))}
            </DataTable>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleButton: {
    marginBottom: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#3b82f6',
  },
  inactiveToggle: {
    backgroundColor: '#e2e8f0',
  },
  formCard: {
    margin: 16,
    marginTop: 0,
  },
  input: {
    marginBottom: 12,
  },
  menuContainer: {
    marginBottom: 12,
  },
  bookSelectButton: {
    borderColor: '#ccc',
  },
  availableQuantity: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'right',
  },
  summaryCard: {
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryValue: {
    fontWeight: 'bold',
  },
  submitButton: {
    marginTop: 16,
  },
  tableCard: {
    margin: 16,
    marginTop: 0,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    fontStyle: 'italic',
    padding: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  lowStockRow: {
    backgroundColor: '#fff5f5',
  },
  lowStockText: {
    color: '#dc2626',
    fontSize: 12,
  },
});