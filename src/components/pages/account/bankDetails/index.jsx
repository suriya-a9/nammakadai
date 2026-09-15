'use client';
import Breadcrumb from '@/utils/commonComponents/breadcrumb';
import WrapperComponent from '@/components/widgets/WrapperComponent';
import AccountSidebar from '../common/AccountSidebar';
import { Col, TabContent, TabPane } from 'reactstrap';
import ResponsiveMenuOpen from '../common/ResponsiveMenuOpen';
import BankDetailForm from './BankDetailForm';

const BankDetailsContent = () => {
  return (
    <>
      <Breadcrumb title={'BankDetails'} subNavigation={[{ name: 'BankDetails' }]} />
      <WrapperComponent classes={{ sectionClass: 'dashboard-section section-b-space user-dashboard-section',fluidClass:'container' }} customCol={true}>
        <AccountSidebar tabActive={'bank-details'} />
        <Col xxl={9} lg={8}>
          <ResponsiveMenuOpen />
          <div className='faq-content'>
            <TabContent>
              <TabPane className='show active'>
                <BankDetailForm />
              </TabPane>
            </TabContent>
          </div>
        </Col>
      </WrapperComponent>
    </>
  );
};

export default BankDetailsContent;
