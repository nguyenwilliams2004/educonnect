import React from 'react';
import { AuthModal } from './AuthModal';
import { ContactZaloModal } from './ContactZaloModal';
import { EnrollmentModal } from './EnrollmentModal';
import { CheckoutModal } from './CheckoutModal';
import { TeacherWalletModal } from './TeacherWalletModal';
import { TeacherProfileModal } from './TeacherProfileModal';
import { ReviewModal } from './ReviewModal';
import { MyTrialsModal } from './MyTrialsModal';
import { StudentProfileModal } from './StudentProfileModal';

export function ModalContainer() {
  return (
    <>
      <AuthModal />
      <ContactZaloModal />
      <EnrollmentModal />
      <CheckoutModal />
      <TeacherWalletModal />
      <TeacherProfileModal />
      <ReviewModal />
      <MyTrialsModal />
      <StudentProfileModal />
    </>
  );
}

export default ModalContainer;
