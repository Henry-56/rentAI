import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ExploreRentals } from './components/Search/ExploreRentals';
import { OwnerDashboard } from './components/OwnerDashboard';
import { ItemDetail } from './components/ItemDetail';
import { Chatbot } from './components/Chatbot';
import { LoginForm, RegisterForm } from './components/AuthForms';
import { RenterDashboard } from './components/RenterDashboard';
import { Cart } from './components/Cart';
import { User, UserRole, Item, RentalTransaction, RentalStatus } from './types';
import { CATEGORIES } from './constants';
import { items as itemsApi, rentals as rentalsApi, auth } from './services/api';
import { getCookie, setCookie, PREF_COOKIE_NAME } from './utils/cookieUtils';
import { CookieConsent } from './components/CookieConsent';

const App: React.FC = () => {
  // Global state
  const [items, setItems] = useState<Item[]>([]);
  const [rentals, setRentals] = useState<RentalTransaction[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'detail' | 'login' | 'register' | 'my-rentals' | 'cart'>('home');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Search & Filter State
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await auth.me();
          setCurrentUser(response.data);
        } catch (error) {
          console.error("Session expired:", error);
          localStorage.removeItem('token');
        }
      }
    };
    checkSession();

    // Fetch items from backend
    const fetchItems = async () => {
      try {
        const response = await itemsApi.getAll();
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    // Fetch user rentals if user is logged in
    if (currentUser) {
      fetchUserRentals();
    }
  }, [currentUser]);

  useEffect(() => {
    const savedCategory = getCookie(PREF_COOKIE_NAME);
    if (savedCategory && CATEGORIES.includes(savedCategory)) {
      setSelectedCategory(savedCategory);
    }
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCookie(PREF_COOKIE_NAME, category, 30);
    // If not on home, go to home to see results
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setSelectedItem(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setCurrentPage('home');
    setRentals([]);
  };

  const handleSwitchRole = async () => {
    if (!currentUser) return;
    try {
      const response = await auth.switchRole();
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setCurrentUser(user);
      setSelectedItem(null);
      setCurrentPage('home');
    } catch (error) {
      console.error("Failed to switch role:", error);
      alert("Error cambiando de modo. Intenta nuevamente.");
    }
  };

  const fetchUserRentals = async () => {
    if (!currentUser) return;
    try {
      const response = await rentalsApi.getMyRentals();
      setRentals(response.data);
    } catch (e) { console.error("Error fetching rentals", e) }
  };

  const handleNavigate = (page: string) => {
    if (page === 'home') {
      setSelectedItem(null);
      setCurrentPage('home');
    } else if (page === 'login') {
      setCurrentPage('login');
    } else if (page === 'register') {
      setCurrentPage('register');
    } else if (page === 'my-rentals') {
      setCurrentPage('my-rentals');
      fetchUserRentals();
    } else if (page === 'cart') {
      setCurrentPage('cart');
      fetchUserRentals();
    }
  };

  const handleSearch = (query: string) => {
    setGlobalSearchQuery(query);
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setSelectedItem(null);
    }
  };

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setCurrentPage('detail');
  };

  const handleAddItem = async (newItemData: Omit<Item, 'id' | 'ownerId' | 'available' | 'rating' | 'reviewCount'>) => {
    if (!currentUser) return;
    try {
      const response = await itemsApi.create(newItemData);
      setItems(prev => [response.data, ...prev]);
    } catch (error) {
      console.error("Error creating item:", error);
      alert("Error al publicar el artículo");
    }
  };

  const handleEditItem = async (id: string, updatedData: Partial<Item>) => {
    if (!currentUser) return;
    try {
      const response = await itemsApi.update(id, updatedData);
      setItems(prev => prev.map(item => item.id === id ? response.data : item));
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Error al actualizar el artículo");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!currentUser) return;
    try {
      await itemsApi.delete(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error al eliminar el artículo");
    }
  };

  const handleUpdateRentalStatus = async (rentalId: string, status: RentalStatus) => {
    try {
      await rentalsApi.updateStatus(rentalId, status);
      setRentals(prev => prev.map(r => r.id === rentalId ? { ...r, status } : r));
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Error actualizando estado");
    }
  };

  const handleRenterPaymentSuccess = (rentalId: string) => {
    handleUpdateRentalStatus(rentalId, 'IN_REVIEW');
  };

  const handleRenterRateSuccess = (rentalId: string, rating: number, comment: string) => {
    alert("¡Gracias por tu calificación!");
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('home');
  };

  const handleRegisterSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('home');
  };

  const getItemOwner = (ownerId: string): User | undefined => {
    return undefined; // Placeholder
  };

  const cartItems = rentals.filter(r => r.status === 'DRAFT');
  const myRentals = rentals.filter(r => r.status !== 'DRAFT');

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900">
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        onNavigate={handleNavigate}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        onSearch={handleSearch}
      />

      <main className="flex-grow">
        {!currentUser && (currentPage === 'login' || currentPage === 'register') ? (
          currentPage === 'login' ?
            <LoginForm onLogin={handleLoginSuccess} onNavigate={handleNavigate} /> :
            <RegisterForm onRegister={handleRegisterSuccess} onNavigate={handleNavigate} />
        ) : currentUser?.role === UserRole.OWNER ? (
          <OwnerDashboard
            items={items.filter(i => i.ownerId === currentUser.id)}
            rentals={rentals.filter(r => r.ownerId === currentUser.id)}
            onAddItem={handleAddItem}
            onUpdateRentalStatus={handleUpdateRentalStatus}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onMessage={(rental) => alert(`Abriendo chat con ${rental.renterName}... (Funcionalidad de chat simulada)`)}
            onInfo={(rental) => alert(`Detalles del alquiler #${rental.id}:\nArtículo: ${rental.itemTitle}\nTotal: S/ ${rental.totalPrice}`)}
          />
        ) : (
          <>
            {currentPage === 'home' && (
              <ExploreRentals
                onRentalClick={handleItemClick}
                initialQuery={globalSearchQuery}
                initialCategory={selectedCategory}
              />
            )}

            {currentPage === 'cart' && currentUser && (
              <Cart
                cartItems={cartItems}
                onRefresh={fetchUserRentals}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'my-rentals' && currentUser && (
              <RenterDashboard
                rentals={myRentals}
                onPaymentSuccess={handleRenterPaymentSuccess}
                onRateSuccess={handleRenterRateSuccess}
              />
            )}

            {currentPage === 'detail' && selectedItem && (
              <ItemDetail
                item={selectedItem}
                owner={getItemOwner(selectedItem.ownerId)}
                onBack={() => {
                  setCurrentPage('home');
                  fetchUserRentals();
                }}
              />
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-10 mt-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-sm">
            <div>
              <h4 className="font-bold mb-3">Comprar</h4>
              <ul className="text-slate-500 space-y-2">
                <li><a href="#" className="hover:underline">Registro</a></li>
                <li><a href="#" className="hover:underline">Garantía RentAI</a></li>
                <li><a href="#" className="hover:underline">Ayuda para comprar</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Vender</h4>
              <ul className="text-slate-500 space-y-2">
                <li><a href="#" className="hover:underline">Empezar a vender</a></li>
                <li><a href="#" className="hover:underline">Aprender a vender</a></li>
                <li><a href="#" className="hover:underline">Equipos profesionales</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 text-[11px] text-slate-400 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>Copyright © 1995-2024 RentAI Inc. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">Condiciones de uso</a>
              <a href="#" className="hover:underline">Aviso de privacidad</a>
              <a href="#" className="hover:underline">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      <Chatbot />
      <CookieConsent />
    </div>
  );
};

export default App;