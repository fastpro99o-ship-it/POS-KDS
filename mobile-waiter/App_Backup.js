import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, FlatList, SafeAreaView,
    StyleSheet, Alert, ScrollView, StatusBar, Dimensions,
    TextInput, Platform, Modal, ActivityIndicator
} from 'react-native';
import { supabase } from './src/lib/supabase';
import {
    Send, Trash2, Home, Search, ShoppingCart, User,
    ArrowLeft, Plus, Minus, ChevronRight, MapPin, X, Check
} from 'lucide-react-native';
import { useFonts } from 'expo-font';
import { Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold } from '@expo-google-fonts/poppins';
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';

const API_BASE = 'http://192.168.1.53:3000';
const { width } = Dimensions.get('window');

// ===== MENU =====
const MENU_ITEMS = [
    { id: 1, name: "THE شاي", price: 8, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner", "Boissons & Salades"] },
    { id: 2, name: "CAFE قهوة", price: 6, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner", "Boissons & Salades"] },
    { id: 3, name: "JUS AU CHOIX عصير", price: 10, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner", "Boissons & Salades"] },
    { id: 4, name: "LAIT AU CHOCOLAT", price: 6, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner", "Boissons & Salades"] },
    { id: 5, name: "OMELETTE AU KHLI3", price: 15, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 6, name: "OMELETTE AU FROMAGE", price: 10, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 7, name: "OMELETTE AUX CREVETTES", price: 15, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 8, name: "OMELETTE NATURE", price: 6, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 9, name: "OMELETTE AUX CHAMPIGNONS", price: 8, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 10, name: "CREPE AUX FRUITS ET CHOCOLAT", price: 15, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 11, name: "GAUFRES", price: 15, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 12, name: "PANNA COTTA", price: 15, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 13, name: "CREME CARAMEL", price: 10, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 14, name: "TIRAMISU", price: 15, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 15, name: "MSEMEN مسمن", price: 3, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 16, name: "MAKHMAR مخمار", price: 3, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 17, name: "OMELETTE FROMAGE", price: 10, station: "Kitchen", emoji: "🥪", variants: [{ name: "Sandwich (S)", price: 10 }, { name: "Panini (P)", price: 15 }], extras: [{ name: "إضافة أومليت", price: 5 }], categories: ["Sandwich / Panini"] },
    { id: 18, name: "POULET", price: 15, station: "Kitchen", emoji: "🥪", variants: [{ name: "Sandwich (S)", price: 15 }, { name: "Panini (P)", price: 20 }], extras: [{ name: "إضافة أومليت", price: 5 }], categories: ["Sandwich / Panini"] },
    { id: 19, name: "SAUCISSES", price: 15, station: "Kitchen", emoji: "🥪", variants: [{ name: "Sandwich (S)", price: 15 }, { name: "Panini (P)", price: 20 }], extras: [{ name: "إضافة أومليت", price: 5 }], categories: ["Sandwich / Panini"] },
    { id: 20, name: "VIANDE HACHEE", price: 15, station: "Kitchen", emoji: "🥪", variants: [{ name: "Sandwich (S)", price: 15 }, { name: "Panini (P)", price: 20 }], extras: [{ name: "إضافة أومليت", price: 5 }], categories: ["Sandwich / Panini"] },
    { id: 21, name: "MIXTE", price: 15, station: "Kitchen", emoji: "🥪", variants: [{ name: "Sandwich (S)", price: 15 }, { name: "Panini (P)", price: 20 }], extras: [{ name: "إضافة أومليت", price: 5 }], categories: ["Sandwich / Panini"] },
    { id: 22, name: "SPECIAL", price: 20, station: "Kitchen", emoji: "🥪", variants: [{ name: "Sandwich (S)", price: 20 }, { name: "Panini (P)", price: 20 }], extras: [{ name: "إضافة أومليت", price: 5 }], categories: ["Sandwich / Panini"] },
    { id: 23, name: "KEEBDA", price: 20, station: "Kitchen", emoji: "🥪", variants: [{ name: "Sandwich (S)", price: 20 }, { name: "Panini (P)", price: 25 }], extras: [{ name: "إضافة أومليت", price: 5 }], categories: ["Sandwich / Panini"] },
    { id: 24, name: "NUGGET", price: 25, station: "Kitchen", emoji: "🥪", variants: [{ name: "Sandwich (S)", price: 25 }, { name: "Panini (P)", price: 25 }], extras: [{ name: "إضافة أومليت", price: 5 }], categories: ["Sandwich / Panini"] },
    { id: 25, name: "CORDON BLEU", price: 25, station: "Kitchen", emoji: "🥪", variants: [{ name: "Sandwich (S)", price: 25 }, { name: "Panini (P)", price: 25 }], extras: [{ name: "إضافة أومليت", price: 5 }], categories: ["Sandwich / Panini"] },
    { id: 26, name: "MARGHERITA", price: 20, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 20 }, { name: "Grand (G)", price: 30 }], extras: [], categories: ["Pizza"] },
    { id: 27, name: "VEGETARIENNE", price: 30, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 30 }, { name: "Grand (G)", price: 40 }], extras: [], categories: ["Pizza"] },
    { id: 28, name: "CHARCUTERIE", price: 30, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 30 }, { name: "Grand (G)", price: 40 }], extras: [], categories: ["Pizza"] },
    { id: 29, name: "POULET Pizza", price: 30, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 30 }, { name: "Grand (G)", price: 40 }], extras: [], categories: ["Pizza"] },
    { id: 30, name: "THON", price: 30, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 30 }, { name: "Grand (G)", price: 40 }], extras: [], categories: ["Pizza"] },
    { id: 31, name: "VIANDE HACHEE Pizza", price: 30, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 30 }, { name: "Grand (G)", price: 40 }], extras: [], categories: ["Pizza"] },
    { id: 32, name: "4 FROMAGE", price: 40, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 40 }, { name: "Grand (G)", price: 50 }], extras: [], categories: ["Pizza"] },
    { id: 33, name: "4 SAISON", price: 40, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 40 }, { name: "Grand (G)", price: 50 }], extras: [], categories: ["Pizza"] },
    { id: 34, name: "FRUITS DE MER Pizza", price: 40, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 40 }, { name: "Grand (G)", price: 50 }], extras: [], categories: ["Pizza"] },
    { id: 35, name: "ROYAL Pizza", price: 45, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 45 }, { name: "Grand (G)", price: 55 }], extras: [], categories: ["Pizza"] },
    { id: 36, name: "PARIS FOOD", price: 45, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 45 }, { name: "Grand (G)", price: 55 }], extras: [], categories: ["Pizza"] },
    { id: 37, name: "CHOCOLAT Pizza", price: 30, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 30 }, { name: "Grand (G)", price: 35 }], extras: [], categories: ["Pizza"] },
    { id: 38, name: "POULET Plat", price: 40, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Plats & Pates"] },
    { id: 39, name: "SAUCISSES Plat", price: 40, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Plats & Pates"] },
    { id: 40, name: "VIANDE HACHEE Plat", price: 40, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Plats & Pates"] },
    { id: 41, name: "PLATS NUGGET", price: 40, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Plats & Pates"] },
    { id: 42, name: "EMINCE POULET", price: 40, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Plats & Pates"] },
    { id: 43, name: "CORDON BLEU Plat", price: 40, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Plats & Pates"] },
    { id: 44, name: "PLATS ESCALOPE", price: 50, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Plats & Pates"] },
    { id: 45, name: "BECARBONARA", price: 30, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Plats & Pates"] },
    { id: 46, name: "POULET Pates", price: 30, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Plats & Pates"] },
    { id: 47, name: "BOLONAISE", price: 30, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Plats & Pates"] },
    { id: 48, name: "FRUIT DE MER Pates", price: 40, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Plats & Pates"] },
    { id: 49, name: "JUS D'ORANGE", price: 15, station: "Bar", emoji: "🥤", variants: [], extras: [], categories: ["Boissons & Salades"] },
    { id: 50, name: "JUS DE BANAN", price: 15, station: "Bar", emoji: "🥤", variants: [], extras: [], categories: ["Boissons & Salades"] },
    { id: 51, name: "JUS D'AVOCAT", price: 20, station: "Bar", emoji: "🥤", variants: [], extras: [], categories: ["Boissons & Salades"] },
    { id: 52, name: "JUS MOKHITO", price: 20, station: "Bar", emoji: "🥤", variants: [], extras: [], categories: ["Boissons & Salades"] },
    { id: 53, name: "JUS PANACHE", price: 20, station: "Bar", emoji: "🥤", variants: [], extras: [], categories: ["Boissons & Salades"] },
    { id: 54, name: "JUS ZA3ZA3", price: 30, station: "Bar", emoji: "🥤", variants: [], extras: [], categories: ["Boissons & Salades"] },
    { id: 55, name: "CANETTES", price: 6, station: "Bar", emoji: "🥤", variants: [], extras: [], categories: ["Boissons & Salades"] },
    { id: 56, name: "SALADE PECHEUR", price: 40, station: "Bar", emoji: "🥗", variants: [], extras: [], categories: ["Boissons & Salades"] },
    { id: 57, name: "SALADE MEXICAINE", price: 20, station: "Bar", emoji: "🥗", variants: [], extras: [], categories: ["Boissons & Salades"] },
    { id: 58, name: "SALADE MAROCAINE", price: 20, station: "Bar", emoji: "🥗", variants: [], extras: [], categories: ["Boissons & Salades"] },
    { id: 59, name: "SALADE VARIEE", price: 25, station: "Bar", emoji: "🥗", variants: [], extras: [], categories: ["Boissons & Salades"] },
    { id: 60, name: "CREPE", price: 25, station: "Kitchen", emoji: "🍧", variants: [], extras: [], categories: ["Desserts & Supp"] },
    { id: 61, name: "PANNA COTTA", price: 25, station: "Kitchen", emoji: "🍧", variants: [], extras: [], categories: ["Desserts & Supp"] },
    { id: 62, name: "CREME CARAMEL", price: 35, station: "Kitchen", emoji: "🍧", variants: [], extras: [], categories: ["Desserts & Supp"] },
    { id: 63, name: "TIRAMISU", price: 40, station: "Kitchen", emoji: "🍧", variants: [], extras: [], categories: ["Desserts & Supp"] },
    { id: 64, name: "SALADE DE FRUITS", price: 40, station: "Kitchen", emoji: "🍧", variants: [], extras: [], categories: ["Desserts & Supp"] },
    { id: 65, name: "NUGGET 5 PIECES", price: 20, station: "Kitchen", emoji: "🍧", variants: [], extras: [], categories: ["Desserts & Supp"] },
    { id: 66, name: "FRITE", price: 5, station: "Kitchen", emoji: "🍟", variants: [], extras: [], categories: ["Desserts & Supp"] },
    { id: 67, name: "FROMAGE", price: 5, station: "Kitchen", emoji: "🍧", variants: [], extras: [], categories: ["Desserts & Supp"] },
    { id: 68, name: "POULET Tacos", price: 25, station: "Kitchen", emoji: "🌮", variants: [{ name: "L", price: 25 }, { name: "XL", price: 35 }], extras: [], categories: ["Tacos"] },
    { id: 69, name: "SAUCISSES Tacos", price: 25, station: "Kitchen", emoji: "🌮", variants: [{ name: "L", price: 25 }, { name: "XL", price: 35 }], extras: [], categories: ["Tacos"] },
    { id: 70, name: "VIANDE HACHEE Tacos", price: 25, station: "Kitchen", emoji: "🌮", variants: [{ name: "L", price: 25 }, { name: "XL", price: 35 }], extras: [], categories: ["Tacos"] },
    { id: 71, name: "MIXTE Tacos", price: 30, station: "Kitchen", emoji: "🌮", variants: [{ name: "L", price: 30 }, { name: "XL", price: 40 }], extras: [], categories: ["Tacos"] },
    { id: 72, name: "NUGGET Tacos", price: 30, station: "Kitchen", emoji: "🌮", variants: [{ name: "L", price: 30 }, { name: "XL", price: 40 }], extras: [], categories: ["Tacos"] },
    { id: 73, name: "CRESPI", price: 30, station: "Kitchen", emoji: "🌮", variants: [{ name: "L", price: 30 }, { name: "XL", price: 40 }], extras: [], categories: ["Tacos"] },
    { id: 74, name: "CORDON BLEU Tacos", price: 30, station: "Kitchen", emoji: "🌮", variants: [{ name: "L", price: 30 }], extras: [], categories: ["Tacos"] },
    { id: 75, name: "ROYAL Tacos", price: 40, station: "Kitchen", emoji: "🌮", variants: [{ name: "L", price: 40 }], extras: [], categories: ["Tacos"] },
    { id: 76, name: "PASTICOS", price: 40, station: "Oven", emoji: "🥘", variants: [], extras: [{ name: "غراتان (Gratine)", price: 5 }, { name: "غراتان بيتزا (Gratine Pizza)", price: 10 }], categories: ["Pasticos"] },
];

const CATEGORIES = [
    { id: 'Petit Dejeuner', name: 'فطور صباحي', emoji: '☕', color: '#FFF3E0' },
    { id: 'Sandwich / Panini', name: 'ساندويتش / بانيني', emoji: '🥪', color: '#FFF3E0' },
    { id: 'Pizza', name: 'بيتزا', emoji: '🍕', color: '#FFF3E0' },
    { id: 'Tacos', name: 'تاكوس', emoji: '🌮', color: '#FFF3E0' },
    { id: 'Plats & Pates', name: 'أطباق و معكرونة', emoji: '🍝', color: '#FFF3E0' },
    { id: 'Boissons & Salades', name: 'مشروبات و سلطات', emoji: '🥤', color: '#FFF3E0' },
    { id: 'Desserts & Supp', name: 'حلويات و إضافات', emoji: '🍧', color: '#FFF3E0' },
    { id: 'Pasticos', name: 'باستيكوس', emoji: '🥘', color: '#FFF3E0' },
];

const CONDIMENTS = ['حار 🌶️', 'كاتشب 🍅', 'مايونيز 🥚'];
const ORDER_TYPES = [
    { key: 'Dine-In', label: 'في المطعم', icon: '🍽️' },
    { key: 'Carry-Out', label: 'تيك أواي', icon: '🥡' },
    { key: 'Delivery', label: 'توصيل', icon: '🛵' },
];

// ===== DESIGN SYSTEM =====
const COLORS = {
    primary: '#FF7A00',
    primaryLight: 'rgba(255, 122, 0, 0.1)',
    primaryShadow: 'rgba(255, 122, 0, 0.3)',
    background: '#FFFFFF',
    cardBody: '#FAFAFA',
    textMain: '#1A1A1A',
    textMuted: '#757575',
    border: '#E0E0E0',
    white: '#FFFFFF',
    danger: '#FF3B30',
};

const FONTS = {
    bold: 'Poppins_700Bold',
    semi: 'Poppins_600SemiBold',
    extra: 'Poppins_800ExtraBold',
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    mainBold: 'Inter_700Bold',
};

// ===== ITEM MODAL =====
function ItemDetailModal({ item, visible, onClose, onConfirm }) {
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [selectedCondiments, setSelectedCondiments] = useState([]);

    React.useEffect(() => {
        if (item) {
            setSelectedVariant(item.variants?.length > 0 ? item.variants[0] : null);
            setSelectedExtras([]);
            setSelectedCondiments([]);
        }
    }, [item?.id]);

    if (!item) return null;

    const toggleExtra = (extra) => {
        setSelectedExtras(prev => prev.find(e => e.name === extra.name) ? prev.filter(e => e.name !== extra.name) : [...prev, extra]);
    };
    const toggleCondiment = (c) => {
        setSelectedCondiments(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
    };

    const currentTotal = (selectedVariant ? selectedVariant.price : item.price) + selectedExtras.reduce((s, e) => s + e.price, 0);

    const handleAdd = () => {
        let n = item.name, p = item.price;
        if (selectedVariant) { n += ' (' + selectedVariant.name + ')'; p = selectedVariant.price; }
        if (selectedExtras.length > 0) { n += ' + ' + selectedExtras.map(e => e.name).join(' + '); p += selectedExtras.reduce((s, e) => s + e.price, 0); }
        if (selectedCondiments.length > 0) { n += ' + ' + selectedCondiments.join(' + '); }
        onConfirm({ ...item, id: item.id + '-' + Date.now(), name: n, price: p });
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={ms.overlay}>
                <View style={ms.box}>
                    <View style={ms.header}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <Text style={{ fontSize: 44, marginRight: 16 }}>{item.emoji}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={ms.title}>{item.name}</Text>
                                <Text style={ms.sub}>{item.categories?.join(' • ')}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={ms.closeBtn} onPress={onClose}><X size={20} color={COLORS.textMain} /></TouchableOpacity>
                    </View>
                    <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                        {item.variants?.length > 0 && (
                            <View style={{ marginBottom: 24 }}>
                                <Text style={ms.secTitle}>اختر المتغير / الحجم</Text>
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    {item.variants.map((v, i) => (
                                        <TouchableOpacity key={i} style={[ms.varBtn, selectedVariant?.name === v.name && ms.varActive]} onPress={() => setSelectedVariant(v)}>
                                            <Text style={[ms.varName, selectedVariant?.name === v.name && { color: COLORS.primary }]}>{v.name}</Text>
                                            <Text style={[ms.varPrice, selectedVariant?.name === v.name && { color: COLORS.primary }]}>{v.price} DH</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                        {item.extras?.length > 0 && (
                            <View style={{ marginBottom: 24 }}>
                                <Text style={ms.secTitle}>إضافات اختيارية</Text>
                                {item.extras.map((ex, i) => {
                                    const sel = selectedExtras.some(e => e.name === ex.name);
                                    return (
                                        <TouchableOpacity key={i} style={[ms.exRow, sel && ms.exRowActive]} onPress={() => toggleExtra(ex)}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={[ms.chk, sel && ms.chkActive]}>{sel && <Check size={14} color="#FFF" />}</View>
                                                <Text style={[ms.exName, sel && { color: COLORS.primary }]}>{ex.name}</Text>
                                            </View>
                                            <Text style={ms.exPrice}>+{ex.price} DH</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                        <View style={{ marginBottom: 24 }}>
                            <Text style={ms.secTitle}>الصلصات و الإضافات (مجانية)</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                {CONDIMENTS.map(c => {
                                    const sel = selectedCondiments.includes(c);
                                    return (
                                        <TouchableOpacity key={c} style={[ms.condBtn, sel && ms.condActive]} onPress={() => toggleCondiment(c)}>
                                            {sel && <Check size={14} color={COLORS.primary} style={{ marginRight: 6 }} />}
                                            <Text style={[ms.condText, sel && { color: COLORS.primary }]}>{c}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </ScrollView>
                    <TouchableOpacity style={ms.addBtn} onPress={handleAdd}>
                        <Text style={ms.addBtnText}>إضافة للطلب</Text>
                        <View style={ms.addBtnPrice}><Text style={ms.addBtnPriceT}>{currentTotal} DH</Text></View>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const ms = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(26,26,26,0.6)' },
    box: { backgroundColor: COLORS.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '85%', shadowColor: COLORS.textMain, shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 15 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    title: { fontSize: 20, fontFamily: FONTS.bold, color: COLORS.textMain },
    sub: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.textMuted, marginTop: 2 },
    closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.cardBody, alignItems: 'center', justifyContent: 'center' },
    secTitle: { fontSize: 16, fontFamily: FONTS.bold, color: COLORS.textMain, marginBottom: 16 },
    varBtn: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.white, alignItems: 'center' },
    varActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
    varName: { fontSize: 15, fontFamily: FONTS.semi, color: COLORS.textMuted },
    varPrice: { fontSize: 14, fontFamily: FONTS.mainBold, color: COLORS.textMain, marginTop: 4 },
    exRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, marginBottom: 10 },
    exRowActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
    chk: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: COLORS.white },
    chkActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    exName: { fontSize: 15, fontFamily: FONTS.medium, color: COLORS.textMain },
    exPrice: { fontSize: 14, fontFamily: FONTS.mainBold, color: COLORS.textMuted },
    condBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, flexDirection: 'row', alignItems: 'center' },
    condActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
    condText: { fontSize: 14, fontFamily: FONTS.medium, color: COLORS.textMain },
    addBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 24, backgroundColor: COLORS.primary, padding: 20, borderRadius: 24, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
    addBtnText: { color: COLORS.white, fontSize: 18, fontFamily: FONTS.bold },
    addBtnPrice: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14 },
    addBtnPriceT: { color: COLORS.white, fontSize: 15, fontFamily: FONTS.bold },
});

// ===== MAIN APP =====
export default function App() {
    let [fontsLoaded] = useFonts({
        Poppins_600SemiBold,
        Poppins_700Bold,
        Poppins_800ExtraBold,
        Inter_400Regular,
        Inter_500Medium,
        Inter_700Bold,
    });

    const [basket, setBasket] = useState([]);
    const [table, setTable] = useState('1');
    const [orderType, setOrderType] = useState('Dine-In');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalItem, setModalItem] = useState(null);
    const [showTablePicker, setShowTablePicker] = useState(false);

    if (!fontsLoaded) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}><ActivityIndicator size="large" color="#FF7A00" /></View>;
    }

    const addToBasket = (item) => { setBasket(prev => [...prev, { ...item, qty: 1, note: '' }]); setModalItem(null); };
    const updateQty = (id, d) => { setBasket(prev => prev.map(i => i.id !== id ? i : { ...i, qty: Math.max(1, i.qty + d) }).filter(i => i.qty > 0)); };
    const updateNote = (id, note) => { setBasket(prev => prev.map(i => i.id === id ? { ...i, note } : i)); };
    const removeFromBasket = (id) => setBasket(prev => prev.filter(i => i.id !== id));
    const basketTotal = basket.reduce((s, i) => s + i.price * i.qty, 0);
    const basketCount = basket.reduce((s, i) => s + i.qty, 0);

    const submitOrder = async () => {
        if (basket.length === 0) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/api/orders`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table, type: orderType, total_amount: basketTotal,
                    items: basket.map(i => ({ name: i.name, qty: i.qty, price: i.price, station: i.station || 'Kitchen', note: i.note || '' })),
                }),
            });
            const data = await res.json();
            if (data.success) { Alert.alert('✅', 'تم إرسال الطلب للمطبخ بنجاح'); setBasket([]); setActiveTab('home'); }
            else { Alert.alert('خطأ', data.error || 'حدث خطأ أثناء الإرسال'); }
        } catch (err) {
            console.error('Submit Error:', err);
            Alert.alert('خطأ في الاتصال بالسيرفر',
                `تعذر الوصول إلى: ${API_BASE}\n\n1. تأكد أن الهاتف والكمبيوتر على نفس الـ Wi-Fi\n2. تأكد من إيقاف جدار الحماية (Firewall) مؤقتاً\n\nالتفاصيل: ${err.message}`
            );
        }
        setIsSubmitting(false);
    };

    const getCategoryItems = (cat) => MENU_ITEMS.filter(i => i.categories?.includes(cat.id));

    // HOME
    const renderHome = () => (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={s.homeHeader}>
                <View>
                    <Text style={s.deliverLabel}>DELIVERING TO</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <MapPin size={18} color={COLORS.primary} />
                        <Text style={s.locationText}> Table {table}</Text>
                    </View>
                </View>
                <TouchableOpacity style={s.cartBadgeBtn} onPress={() => setActiveTab('cart')}>
                    <ShoppingCart size={22} color={COLORS.textMain} />
                    {basketCount > 0 && <View style={s.badge}><Text style={s.badgeText}>{basketCount}</Text></View>}
                </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: 24, marginTop: 20, marginBottom: 24 }}>
                <Text style={s.welcomeText}>مرحباً! 👋</Text>
                <Text style={s.welcomeSub}>ما الذي تشتهيه اليوم؟</Text>
            </View>
            <View style={s.categoriesGrid}>
                {CATEGORIES.map((cat, i) => (
                    <TouchableOpacity key={cat.id} style={s.categoryCard} activeOpacity={0.85} onPress={() => { setSelectedCategory(cat); setActiveTab('category'); }}>
                        <View style={s.catEmojiWrapper}>
                            <Text style={s.catEmoji}>{cat.emoji}</Text>
                        </View>
                        <Text style={s.catCardName} numberOfLines={2}>{cat.name}</Text>
                        <View style={s.catArrowBtn}><ChevronRight size={16} color={COLORS.primary} /></View>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={{ height: 100 }} />
        </ScrollView>
    );

    // CATEGORY
    const renderCategory = () => {
        const items = selectedCategory ? getCategoryItems(selectedCategory) : [];
        return (
            <View style={{ flex: 1 }}>
                <View style={s.catHeaderPage}>
                    <TouchableOpacity style={s.backBtn} onPress={() => setActiveTab('home')}><ArrowLeft size={24} color={COLORS.textMain} /></TouchableOpacity>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={s.catHeaderTitle}>{selectedCategory?.name}</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>
                <FlatList data={items} keyExtractor={item => item.id.toString()} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
                    ListEmptyComponent={<View style={s.emptyState}><Text style={{ fontSize: 48 }}>{selectedCategory?.emoji}</Text><Text style={s.emptyText}>لا توجد أصناف هنا</Text></View>}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={s.itemCard} onPress={() => setModalItem(item)} activeOpacity={0.8}>
                            <View style={s.itemEmojiBox}><Text style={s.itemEmoji}>{item.emoji}</Text></View>
                            <View style={{ flex: 1, paddingRight: 12 }}>
                                <Text style={s.itemName} numberOfLines={2}>{item.name}</Text>
                                {item.variants?.length > 0 && <Text style={s.itemHint}>{item.variants.map(v => v.name).join(' | ')}</Text>}
                                <Text style={s.itemPrice}>{item.price} <Text style={{ fontSize: 12, fontFamily: FONTS.medium }}>DH</Text></Text>
                            </View>
                            <View style={s.addItemBtn}><Plus size={20} color={COLORS.white} /></View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        );
    };

    // SEARCH
    const results = searchQuery.length > 0 ? MENU_ITEMS.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())) : MENU_ITEMS;
    const renderSearch = () => (
        <View style={{ flex: 1 }}>
            <View style={s.searchHeader}>
                <Text style={s.searchTitle}>البحث عن صنف</Text>
                <View style={s.searchInputWrap}>
                    <Search size={20} color={COLORS.textMuted} />
                    <TextInput style={s.searchInput} placeholder="ابحث عن وجبتك المفضلة..." placeholderTextColor={COLORS.textMuted} value={searchQuery} onChangeText={setSearchQuery} />
                    {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')}><X size={20} color={COLORS.textMuted} /></TouchableOpacity>}
                </View>
            </View>
            <FlatList data={results} keyExtractor={item => item.id.toString()} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
                renderItem={({ item }) => (
                    <TouchableOpacity style={s.itemCard} onPress={() => setModalItem(item)} activeOpacity={0.8}>
                        <View style={s.itemEmojiBox}><Text style={s.itemEmoji}>{item.emoji}</Text></View>
                        <View style={{ flex: 1, paddingRight: 12 }}>
                            <Text style={s.itemName}>{item.name}</Text>
                            <Text style={s.itemPrice}>{item.price} <Text style={{ fontSize: 12, fontFamily: FONTS.medium }}>DH</Text></Text>
                        </View>
                        <View style={s.addItemBtn}><Plus size={20} color={COLORS.white} /></View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );

    // CART
    const renderCart = () => (
        <View style={{ flex: 1 }}>
            <View style={s.cartHeader}>
                <Text style={s.cartTitle}>سلة الطلبات</Text>
            </View>
            {basket.length === 0 ? (
                <View style={s.emptyState}>
                    <View style={s.emptyCartBox}><ShoppingCart size={48} color={COLORS.primary} /></View>
                    <Text style={s.emptyTextTitle}>سلتك فارغة</Text>
                    <Text style={s.emptyTextSub}>ابدأ بإضافة أشهى الأطباق!</Text>
                </View>
            ) : (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 180 }} showsVerticalScrollIndicator={false}>
                    <View style={s.orderDetailsBox}>
                        <View style={{ flexDirection: 'row', gap: 16 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={s.orderDetailLabel}>رقم الطاولة</Text>
                                <TouchableOpacity style={s.selectBtn} onPress={() => setShowTablePicker(!showTablePicker)}>
                                    <Text style={s.selectBtnText}>طاولة {table}</Text>
                                    <ChevronRight size={16} color={COLORS.textMuted} />
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.orderDetailLabel}>نوع الطلب</Text>
                                <TouchableOpacity style={s.selectBtn} onPress={() => { const idx = ORDER_TYPES.findIndex(t => t.key === orderType); setOrderType(ORDER_TYPES[(idx + 1) % ORDER_TYPES.length].key); }}>
                                    <Text style={s.selectBtnText}>{ORDER_TYPES.find(t => t.key === orderType)?.icon} {ORDER_TYPES.find(t => t.key === orderType)?.label}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {showTablePicker && (
                            <View style={s.tableQuickPicker}>
                                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(t => (
                                    <TouchableOpacity key={t} style={[s.tableQuickBtn, table === t && s.tableQuickBtnActive]} onPress={() => { setTable(t); setShowTablePicker(false); }}>
                                        <Text style={[s.tableQuickBtnText, table === t && { color: COLORS.white }]}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                    <View style={{ paddingHorizontal: 20 }}>
                        {basket.map((item, idx) => (
                            <View key={item.id.toString() + idx} style={s.cartItemCard}>
                                <View style={s.cartItemRow}>
                                    <View style={s.itemEmojiBoxSmall}><Text style={{ fontSize: 24 }}>{item.emoji || '🍔'}</Text></View>
                                    <View style={{ flex: 1, marginLeft: 16 }}>
                                        <Text style={s.cartItemName} numberOfLines={2}>{item.name}</Text>
                                        <Text style={s.cartItemPrice}>{item.price} <Text style={{ fontSize: 12, fontFamily: FONTS.medium }}>DH</Text></Text>
                                    </View>
                                    <TouchableOpacity style={s.trashBtn} onPress={() => removeFromBasket(item.id)}><Trash2 size={20} color={COLORS.danger} /></TouchableOpacity>
                                </View>
                                <View style={s.cartItemFooter}>
                                    <View style={s.qtyControls}>
                                        <TouchableOpacity style={s.qtyBtnLight} onPress={() => updateQty(item.id, -1)}><Minus size={16} color={COLORS.textMain} /></TouchableOpacity>
                                        <Text style={s.qtyTextLight}>{item.qty}</Text>
                                        <TouchableOpacity style={[s.qtyBtnLight, { backgroundColor: COLORS.primary }]} onPress={() => updateQty(item.id, 1)}><Plus size={16} color={COLORS.white} /></TouchableOpacity>
                                    </View>
                                    <TextInput style={s.noteInput} placeholder="إضافة ملاحظة..." placeholderTextColor={COLORS.textMuted} value={item.note || ''} onChangeText={t => updateNote(item.id, t)} />
                                </View>
                            </View>
                        ))}
                    </View>
                    <View style={s.totalSection}>
                        <Text style={s.totalLabel}>المجموع النهائي</Text>
                        <Text style={s.totalValue}>{basketTotal.toFixed(0)} <Text style={{ fontSize: 16, fontFamily: FONTS.bold }}>DH</Text></Text>
                    </View>
                </ScrollView>
            )}
            {basket.length > 0 && (
                <View style={s.checkoutFooter}>
                    <TouchableOpacity style={[s.submitBtn, isSubmitting && { opacity: 0.7 }]} onPress={submitOrder} disabled={isSubmitting}>
                        <View style={s.submitBtnBadge}><Text style={s.submitBtnBadgeText}>{basketCount}</Text></View>
                        <Text style={s.submitBtnText}>{isSubmitting ? 'جاري الإرسال...' : 'تأكيد وإرسال'}</Text>
                        <View style={s.submitArrowBox}><ChevronRight size={20} color={COLORS.primary} /></View>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    // PROFILE
    const renderProfile = () => (
        <View style={{ flex: 1 }}>
            <View style={s.profileHeaderPage}>
                <View style={s.profileAvatar}><User size={40} color={COLORS.primary} /></View>
                <Text style={s.profileName}>إعدادات النادل</Text>
            </View>
            <View style={{ padding: 24 }}>
                <Text style={s.sectionLabel}>تحديد الطاولة الحالية</Text>
                <View style={s.tableGrid}>
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(t => (
                        <TouchableOpacity key={t} style={[s.tableBtn, table === t && s.tableBtnActive]} onPress={() => setTable(t)}>
                            <Text style={[s.tableBtnText, table === t && s.tableBtnTextActive]}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={s.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            {activeTab === 'home' && renderHome()}
            {activeTab === 'category' && renderCategory()}
            {activeTab === 'search' && renderSearch()}
            {activeTab === 'cart' && renderCart()}
            {activeTab === 'profile' && renderProfile()}
            <ItemDetailModal item={modalItem} visible={!!modalItem} onClose={() => setModalItem(null)} onConfirm={addToBasket} />
            <View style={s.bottomNav}>
                {[
                    { key: 'home', icon: Home, label: 'الرئيسية' },
                    { key: 'search', icon: Search, label: 'بحث' },
                    { key: 'cart', icon: ShoppingCart, label: 'السلة', badge: basketCount },
                    { key: 'profile', icon: User, label: 'حسابي' },
                ].map(tab => {
                    const active = activeTab === tab.key || (activeTab === 'category' && tab.key === 'home');
                    const IC = tab.icon;
                    return (
                        <TouchableOpacity key={tab.key} style={s.navItem} onPress={() => setActiveTab(tab.key)} activeOpacity={0.7}>
                            <View style={s.navIconWrap}>
                                <IC size={24} color={active ? COLORS.primary : COLORS.textMuted} strokeWidth={active ? 2.5 : 2} />
                                {tab.badge > 0 && <View style={s.navBadge}><Text style={s.navBadgeText}>{tab.badge}</Text></View>}
                            </View>
                            <Text style={[s.navLabel, active && s.navLabelActive]}>{tab.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </SafeAreaView>
    );
}

// ===== STYLES =====
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // HOME STYLES
    homeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 44 : 10, paddingBottom: 10 },
    deliverLabel: { fontSize: 12, fontFamily: FONTS.bold, color: COLORS.textMuted, letterSpacing: 1 },
    locationText: { fontSize: 16, fontFamily: FONTS.extra, color: COLORS.textMain },
    cartBadgeBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.cardBody, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
    badge: { position: 'absolute', top: -2, right: -2, backgroundColor: COLORS.primary, borderRadius: 12, minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.white },
    badgeText: { color: COLORS.white, fontSize: 11, fontFamily: FONTS.bold },
    welcomeText: { fontSize: 32, fontFamily: FONTS.extra, color: COLORS.textMain, lineHeight: 40 },
    welcomeSub: { fontSize: 16, fontFamily: FONTS.regular, color: COLORS.textMuted, marginTop: 4 },
    categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, justifyContent: 'space-between' },
    categoryCard: { width: (width - 56) / 2, backgroundColor: COLORS.cardBody, borderRadius: 28, padding: 20, marginBottom: 16, shadowColor: COLORS.textMain, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, alignItems: 'center' },
    catEmojiWrapper: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: COLORS.textMain, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
    catEmoji: { fontSize: 32 },
    catCardName: { fontSize: 15, fontFamily: FONTS.bold, color: COLORS.textMain, textAlign: 'center', marginBottom: 12 },
    catArrowBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },

    // CATEGORY PAGE STYLES
    catHeaderPage: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 44 : 20, paddingBottom: 20 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.cardBody, alignItems: 'center', justifyContent: 'center' },
    catHeaderTitle: { fontSize: 20, fontFamily: FONTS.bold, color: COLORS.textMain },
    itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.textMain, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
    itemEmojiBox: { width: 60, height: 60, borderRadius: 20, backgroundColor: COLORS.cardBody, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    itemEmoji: { fontSize: 32 },
    itemName: { fontSize: 16, fontFamily: FONTS.bold, color: COLORS.textMain, marginBottom: 4 },
    itemPrice: { fontSize: 18, fontFamily: FONTS.extra, color: COLORS.primary, marginTop: 4 },
    itemHint: { fontSize: 12, fontFamily: FONTS.medium, color: COLORS.textMuted },
    addItemBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },

    // SEARCH STYLES
    searchHeader: { paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 44 : 20, paddingBottom: 16 },
    searchTitle: { fontSize: 28, fontFamily: FONTS.extra, color: COLORS.textMain, marginBottom: 16 },
    searchInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBody, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: COLORS.border },
    searchInput: { flex: 1, fontSize: 16, fontFamily: FONTS.medium, marginLeft: 12, color: COLORS.textMain },

    // CART STYLES
    cartHeader: { paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 44 : 20, paddingBottom: 20 },
    cartTitle: { fontSize: 28, fontFamily: FONTS.extra, color: COLORS.textMain },
    orderDetailsBox: { margin: 20, backgroundColor: COLORS.white, borderRadius: 28, padding: 20, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.textMain, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3 },
    orderDetailLabel: { fontSize: 13, fontFamily: FONTS.bold, color: COLORS.textMuted, marginBottom: 10 },
    selectBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.cardBody, borderRadius: 16, padding: 16 },
    selectBtnText: { fontSize: 15, fontFamily: FONTS.bold, color: COLORS.textMain },
    tableQuickPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
    tableQuickBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.cardBody, alignItems: 'center', justifyContent: 'center' },
    tableQuickBtnActive: { backgroundColor: COLORS.primary },
    tableQuickBtnText: { fontSize: 16, fontFamily: FONTS.bold, color: COLORS.textMain },
    cartItemCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.textMain, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
    cartItemRow: { flexDirection: 'row', alignItems: 'center' },
    itemEmojiBoxSmall: { width: 50, height: 50, borderRadius: 16, backgroundColor: COLORS.cardBody, alignItems: 'center', justifyContent: 'center' },
    cartItemName: { fontSize: 15, fontFamily: FONTS.bold, color: COLORS.textMain, marginBottom: 4 },
    cartItemPrice: { fontSize: 16, fontFamily: FONTS.extra, color: COLORS.primary },
    trashBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center' },
    cartItemFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 12 },
    qtyControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBody, borderRadius: 20, padding: 4 },
    qtyBtnLight: { width: 36, height: 36, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.textMain, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    qtyTextLight: { fontSize: 16, fontFamily: FONTS.bold, color: COLORS.textMain, width: 32, textAlign: 'center' },
    noteInput: { flex: 1, backgroundColor: COLORS.cardBody, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, fontSize: 13, fontFamily: FONTS.regular, color: COLORS.textMain },
    totalSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 24, marginTop: 10, paddingVertical: 24, borderTopWidth: 1, borderTopColor: COLORS.border },
    totalLabel: { fontSize: 18, fontFamily: FONTS.medium, color: COLORS.textMuted },
    totalValue: { fontSize: 28, fontFamily: FONTS.extra, color: COLORS.textMain },
    checkoutFooter: {
        position: 'absolute', bottom: Platform.OS === 'ios' ? 90 : 80, left: 0, right: 0, paddingHorizontal: 24, paddingVertical: 16, backgroundColor: 'rgba(255,255,255,0.9)',
    /* backdrop filter effect workaround for RN */ shadowColor: COLORS.textMain, shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 15
    },
    submitBtn: { backgroundColor: COLORS.primary, flexDirection: 'row', padding: 12, borderRadius: 100, alignItems: 'center', justifyContent: 'space-between', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
    submitBtnText: { color: COLORS.white, fontFamily: FONTS.bold, fontSize: 18 },
    submitArrowBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
    submitBtnBadge: { backgroundColor: 'rgba(255,255,255,0.2)', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
    submitBtnBadgeText: { color: COLORS.white, fontSize: 16, fontFamily: FONTS.bold },

    // EMPTY STATE
    emptyCartBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
    emptyTextTitle: { fontSize: 24, fontFamily: FONTS.bold, color: COLORS.textMain, marginBottom: 8 },
    emptyTextSub: { fontSize: 16, fontFamily: FONTS.regular, color: COLORS.textMuted },
    emptyText: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.textMuted, marginTop: 16 },

    // PROFILE
    profileHeaderPage: { alignItems: 'center', paddingTop: Platform.OS === 'android' ? 60 : 40, paddingBottom: 32, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    profileAvatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    profileName: { fontSize: 28, fontFamily: FONTS.bold, color: COLORS.textMain },
    sectionLabel: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.textMain, marginBottom: 16 },
    tableGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    tableBtn: { width: (width - 84) / 4, aspectRatio: 1, borderRadius: 20, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.border },
    tableBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    tableBtnText: { fontSize: 20, fontFamily: FONTS.bold, color: COLORS.textMuted },
    tableBtnTextActive: { color: COLORS.white },

    // BOTTOM NAV
    bottomNav: { flexDirection: 'row', backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, paddingBottom: Platform.OS === 'ios' ? 24 : 12, paddingTop: 12 },
    navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    navIconWrap: { position: 'relative', padding: 8, borderRadius: 20, marginBottom: 4 },
    navLabel: { fontSize: 11, fontFamily: FONTS.medium, color: COLORS.textMuted },
    navLabelActive: { color: COLORS.primary, fontFamily: FONTS.bold },
    navBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.danger, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.white },
    navBadgeText: { color: COLORS.white, fontSize: 10, fontFamily: FONTS.bold },
});
