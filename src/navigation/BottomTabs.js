import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../views/HomeScreen';
import SearchScreen from '../views/SearchScreen';
import MusicPlayerScreen from '../views/MusicPlayerScreen';
import SocialScreen from '../views/SocialScreen';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
return (
<Tab.Navigator
screenOptions={({ route }) => ({
tabBarIcon: ({ color, size }) => {
let iconName;

switch (route.name) {
case 'Home':
iconName = 'home-outline';
break;
case 'Music':
iconName = 'musical-notes-outline';
break;
case 'Search':
iconName = 'search-outline';
break;
case 'Social':
iconName = 'people-outline';
break;
}
return <Icon name={iconName} size={size} color={color} />;
},
tabBarActiveTintColor: '#1DB954',
tabBarInactiveTintColor: 'gray',
headerShown: false,

})}
>
<Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Music" component={MusicPlayerScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
    </Tab.Navigator>
    );
};

export default BottomTabs;