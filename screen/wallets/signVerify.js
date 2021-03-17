import React, { useEffect, useState, useContext } from 'react';
import { ActivityIndicator, Alert, Keyboard, Platform, StyleSheet, TextInput, View } from 'react-native';
import { useRoute, useTheme } from '@react-navigation/native';

import { BlueDoneAndDismissKeyboardInputAccessory, BlueFormLabel, BlueSpacing10, BlueSpacing20, SafeBlueArea } from '../../BlueComponents';
import navigationStyle from '../../components/navigationStyle';
import { FContainer, FButton } from '../../components/FloatButtons';
import { BlueStorageContext } from '../../blue_modules/storage-context';
import loc from '../../loc';

const SignVerify = () => {
  const { colors } = useTheme();
  const { wallets, sleep } = useContext(BlueStorageContext);
  const { params } = useRoute();
  const [isToolbarVisibleForAndroid, setIsToolbarVisibleForAndroid] = useState(false);
  const [address, setAddress] = useState(params.address);
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const wallet = wallets.find(w => w.getID() === params.walletID);

  useEffect(() => {
    Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setIsToolbarVisibleForAndroid(true));
    Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setIsToolbarVisibleForAndroid(false));
    return () => {
      Keyboard.removeListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide');
      Keyboard.removeListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow');
    };
  }, []);

  const stylesHooks = StyleSheet.create({
    root: {
      backgroundColor: colors.elevated,
    },
    text: {
      borderColor: colors.formBorder,
      borderBottomColor: colors.formBorder,
      backgroundColor: colors.inputBackgroundColor,
      color: colors.foregroundColor,
    },
  });

  const handleSign = async () => {
    setLoading(true);
    await sleep(10); // wait for loading indicator to appear
    try {
      const newSignature = wallet.signMessage(message, address);
      setSignature(newSignature);
    } catch (e) {
      Alert.alert(loc.errors.error, e.message);
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    await sleep(10); // wait for loading indicator to appear
    try {
      const res = wallet.verifyMessage(message, address, signature);
      Alert.alert(
        res ? loc._.success : loc.errors.error,
        res ? loc.addresses.sign_signature_correct : loc.addresses.sign_signature_incorrect,
      );
    } catch (e) {
      Alert.alert(loc.errors.error, e.message);
    }
    setLoading(false);
  };

  if (loading)
    return (
      <View style={[styles.loading]}>
        <ActivityIndicator />
      </View>
    );

  return (
    <SafeBlueArea style={[styles.root, stylesHooks.root]}>
      <BlueSpacing20 />
      <BlueFormLabel>{loc.addresses.sign_help}</BlueFormLabel>
      <BlueSpacing20 />

      <TextInput
        multiline
        textAlignVertical="top"
        blurOnSubmit
        placeholder={loc.addresses.sign_placeholder_address}
        placeholderTextColor="#81868e"
        value={address}
        onChangeText={t => setAddress(t.replace('\n', ''))}
        testID="Signature"
        style={[styles.text, stylesHooks.text]}
        autoCorrect={false}
        autoCapitalize="none"
        spellCheck={false}
        editable={!loading}
      />
      <BlueSpacing10 />

      <TextInput
        multiline
        textAlignVertical="top"
        blurOnSubmit
        placeholder={loc.addresses.sign_placeholder_signature}
        placeholderTextColor="#81868e"
        value={signature}
        onChangeText={t => setSignature(t.replace('\n', ''))}
        testID="Signature"
        style={[styles.text, stylesHooks.text]}
        autoCorrect={false}
        autoCapitalize="none"
        spellCheck={false}
        editable={!loading}
      />
      <BlueSpacing10 />

      <TextInput
        multiline
        placeholder={loc.addresses.sign_placeholder_message}
        placeholderTextColor="#81868e"
        value={message}
        onChangeText={setMessage}
        testID="Message"
        inputAccessoryViewID={BlueDoneAndDismissKeyboardInputAccessory.InputAccessoryViewID}
        style={[styles.flex, styles.text, styles.textMessage, stylesHooks.text]}
        autoCorrect={false}
        autoCapitalize="none"
        spellCheck={false}
        editable={!loading}
      />
      <BlueSpacing20 />

      <FContainer inline>
        <FButton onPress={handleSign} text={loc.addresses.sign_sign} disabled={loading} />
        <FButton onPress={handleVerify} text={loc.addresses.sign_verify} disabled={loading} />
      </FContainer>
      <BlueSpacing10 />

      {Platform.select({
        ios: (
          <BlueDoneAndDismissKeyboardInputAccessory
            onClearTapped={() => setMessage('')}
            onPasteTapped={text => {
              setMessage(text);
              Keyboard.dismiss();
            }}
          />
        ),
        android: isToolbarVisibleForAndroid && (
          <BlueDoneAndDismissKeyboardInputAccessory
            onClearTapped={() => {
              setMessage('');
              Keyboard.dismiss();
            }}
            onPasteTapped={text => {
              setMessage(text);
              Keyboard.dismiss();
            }}
          />
        ),
      })}
    </SafeBlueArea>
  );
};

SignVerify.navigationOptions = navigationStyle({}, opts => ({ ...opts, title: loc.addresses.sign_title }));

export default SignVerify;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // paddingTop: 40,
  },
  text: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginTop: 5,
    marginHorizontal: 20,
    borderWidth: 1,
    borderBottomWidth: 0.5,
    borderRadius: 4,
    textAlignVertical: 'top',
  },
  textMessage: {
    minHeight: 100,
  },
  flex: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
