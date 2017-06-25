import React from 'react';
import './IdentityPage.css';
import { connect } from 'react-redux';
import { IdentityPropertyItem, NewIdentityProperty } from './IdentityProperty/IdentityProperty';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import SaveButton from '../../../../components/common/SaveButton/SaveButton';
import R from 'ramda';
import * as schemaActions from '../../../../store/ducks/schema';

const IdentityPropertiesEditor = ({ identityProperties, onPropertyUpdate }) =>
  <div className="property-types-list">
    {R.toPairs(identityProperties).map(([name, def]) =>
      <IdentityPropertyItem
        name={name}
        onUpdate={newDef => onPropertyUpdate(name, newDef)}
        key={name}
        def={def}
      />,
    )}
  </div>;

const IdentityPage = ({ identityType, identityProperties, updateIdentityProperty, saveSchema }) => {
  const hasChanges = !R.equals(identityProperties.local, identityProperties.remote);

  return (
    <div className="identity-page">
      <SaveButton
        data-comp="save-button"
        hasChanges={hasChanges}
        isSaving={false}
        onClick={() => saveSchema(identityType)}
      />
      <h3 style={{ textTransform: 'capitalize' }}>{identityType}</h3>
      <Tabs>
        <TabList>
          <Tab selected>Properties</Tab>
          <Tab disabled>Permissions</Tab>
        </TabList>
        <TabPanel>
          <IdentityPropertiesEditor
            identityProperties={identityProperties.local}
            onPropertyUpdate={R.curryN(3, updateIdentityProperty)(identityType)}
          />
          <NewIdentityProperty onCreate={R.curryN(3, updateIdentityProperty)(identityType)} />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default connect(
  state => ({
    schema: state.schema,
  }),
  schemaActions,
  ({ schema }, actions, { match: { params: { identityType } }, ...props }) => ({
    identityProperties: schema[identityType],
    identityType,
    ...props,
    ...actions,
  }),
)(IdentityPage);
