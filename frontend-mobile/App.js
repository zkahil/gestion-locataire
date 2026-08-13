
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { IconButton, MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import useAuthStore from './src/store/authStore';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import EspacesScreen from './src/screens/EspacesScreen';
import LocatairesScreen from './src/screens/LocatairesScreen';
import ContratsScreen from './src/screens/ContratsScreen';
import FacturesScreen from './src/screens/FacturesScreen';
import PaiementsScreen from './src/screens/PaiementsScreen';
import CautionsScreen from './src/screens/CautionsScreen';
import AlertesScreen from './src/screens/AlertesScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const theme = { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, primary: '#1a5f7a' } };

function MainTabs() {
    return (
        <Tab.Navigator screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
                const icons = {
                    Dashboard: 'view-dashboard',
                    Espaces: 'door-open',
                    Locataires: 'account-group',
                    Contrats: 'file-signature',
                    Factures: 'receipt',
                    Paiements: 'credit-card',
                    Cautions: 'shield-lock',
                    Alertes: 'bell'
                };
                return <IconButton icon={icons[route.name] || 'circle'} size={size} iconColor={color} />;
            },
            tabBarActiveTintColor: '#1a5f7a',
            headerShown: false,
            tabBarScrollEnabled: true,
        })}>
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Espaces" component={EspacesScreen} />
            <Tab.Screen name="Locataires" component={LocatairesScreen} />
            <Tab.Screen name="Contrats" component={ContratsScreen} />
            <Tab.Screen name="Factures" component={FacturesScreen} />
            <Tab.Screen name="Paiements" component={PaiementsScreen} />
            <Tab.Screen name="Cautions" component={CautionsScreen} />
            <Tab.Screen name="Alertes" component={AlertesScreen} />
        </Tab.Navigator>
    );
}

export default function App() {
    const { user, loadUser } = useAuthStore();
    useEffect(() => { loadUser(); }, []);
    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <NavigationContainer>
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                        {user ? <Stack.Screen name="Main" component={MainTabs} /> : <Stack.Screen name="Login" component={LoginScreen} />}
                    </Stack.Navigator>
                </NavigationContainer>
            </PaperProvider>
        </SafeAreaProvider>
    );
}
