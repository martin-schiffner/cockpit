/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2020 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */

import React from "react";
import {
    Breadcrumb, BreadcrumbItem,
    Page, PageSection, PageSectionVariants,
} from '@patternfly/react-core';

import { ServiceDetails, ServiceTemplate } from "./service-details.jsx";
import { LogsPanel } from "cockpit-components-logs-panel.jsx";
import { systemd_manager } from "./services.jsx";

import cockpit from "cockpit";

const _ = cockpit.gettext;
const permission = cockpit.permission({ admin: true });

export class Service extends React.Component {
    constructor(props) {
        super(props);

        this.state = { error: undefined };

        this.getCurrentUnitTemplate = this.getCurrentUnitTemplate.bind(this);
        this.getCurrentUnitTemplate();
    }

    getCurrentUnitTemplate() {
        const cur_unit_id = this.props.unit.Id;
        const tp = cur_unit_id.indexOf("@");
        const sp = cur_unit_id.lastIndexOf(".");

        this.cur_unit_is_template = (tp != -1 && (tp + 1 == sp || tp + 1 == cur_unit_id.length));

        if (tp != -1 && !this.cur_unit_is_template) {
            this.cur_unit_template = cur_unit_id.substring(0, tp + 1);
            if (sp != -1)
                this.cur_unit_template = this.cur_unit_template + cur_unit_id.substring(sp);
        }
    }

    render() {
        let serviceDetails;
        if (this.cur_unit_is_template) {
            serviceDetails = (
                <ServiceTemplate template={this.props.unit.Id} />
            );
        } else {
            serviceDetails = (
                <ServiceDetails unit={this.props.unit}
                                originTemplate={this.cur_unit_template}
                                permitted={permission.allowed}
                                systemdManager={systemd_manager}
                                isValid={this.props.unitIsValid} />
            );
        }

        const cur_unit_id = this.props.unit.Id;
        const match = [
            "_SYSTEMD_UNIT=" + cur_unit_id, "+",
            "COREDUMP_UNIT=" + cur_unit_id, "+",
            "UNIT=" + cur_unit_id,
        ];

        return (
            <Page id="service-details">
                <PageSection variant={PageSectionVariants.light}>
                    <Breadcrumb>
                        <BreadcrumbItem to='#'>{_("Services")}</BreadcrumbItem>
                        <BreadcrumbItem isActive>
                            {this.props.unit.Id}
                        </BreadcrumbItem>
                    </Breadcrumb>
                </PageSection>
                <PageSection variant={PageSectionVariants.light}>
                    {serviceDetails}
                </PageSection>
                {!this.cur_unit_is_template && (this.props.unit.LoadState === "loaded" || this.props.unit.LoadState === "masked") &&
                <PageSection variant={PageSectionVariants.light}>
                    <LogsPanel title={_("Service Logs")} match={match} emptyMessage={_("No log entries")} max={10} />
                </PageSection>}
            </Page>
        );
    }
}
