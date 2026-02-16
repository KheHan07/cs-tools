// Copyright (c) 2026 WSO2 LLC. (https://www.wso2.com).
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import { describe, it, expect } from "vitest";
import {
  aggregateUpdateStats,
  getStatValue,
  getStatTooltipText,
  NULL_PLACEHOLDER,
} from "@utils/updates";
import { mockRecommendedUpdateLevels } from "@models/mockData";
import { UPDATES_STATS } from "@constants/updatesConstants";

describe("updates utilities", () => {
  describe("aggregateUpdateStats", () => {
    it("should return undefined if data is undefined", () => {
      expect(aggregateUpdateStats(undefined)).toBeUndefined();
    });

    it("should correctly aggregate stats for a 20-product dataset", () => {
      const stats = aggregateUpdateStats(mockRecommendedUpdateLevels);
      expect(stats).toBeDefined();
      if (!stats) return;

      expect(stats.productsTracked).toBe(20);
      expect(stats.totalUpdatesInstalled).toBe(4458);
      expect(stats.totalUpdatesPending).toBe(1534);
      expect(stats.securityUpdatesPending).toBe(429);
      expect(stats.totalUpdatesInstalledBreakdown!.regular).toBe(3667);
      expect(stats.totalUpdatesInstalledBreakdown!.security).toBe(791);
      expect(stats.totalUpdatesPendingBreakdown!.regular).toBe(1105);
      expect(stats.totalUpdatesPendingBreakdown!.security).toBe(429);
    });
  });

  describe("getStatValue", () => {
    const mockStats = {
      productsTracked: 10,
      totalUpdatesInstalled: 100,
      totalUpdatesInstalledBreakdown: { regular: 80, security: 20 },
      totalUpdatesPending: 50,
      totalUpdatesPendingBreakdown: { regular: 30, security: 20 },
      securityUpdatesPending: 20,
    };

    it("should return NULL_PLACEHOLDER if aggregatedData is undefined", () => {
      expect(getStatValue(undefined, "productsTracked")).toBe(NULL_PLACEHOLDER);
    });

    it("should return the correct value for a given key", () => {
      expect(getStatValue(mockStats, "productsTracked")).toBe(10);
      expect(getStatValue(mockStats, "totalUpdatesInstalled")).toBe(100);
    });

    it("should return NULL_PLACEHOLDER if value is an object", () => {
      expect(
        getStatValue(mockStats, "totalUpdatesInstalledBreakdown" as any),
      ).toBe(NULL_PLACEHOLDER);
    });
  });

  describe("getStatTooltipText", () => {
    const mockStats = {
      productsTracked: 10,
      totalUpdatesInstalled: 100,
      totalUpdatesInstalledBreakdown: { regular: 80, security: 20 },
      totalUpdatesPending: 50,
      totalUpdatesPendingBreakdown: { regular: 30, security: 20 },
      securityUpdatesPending: 20,
    };

    const installedStat = UPDATES_STATS.find(
      (s) => s.id === "totalUpdatesInstalled",
    )!;
    const productStat = UPDATES_STATS.find((s) => s.id === "productsTracked")!;

    it("should return default tooltip if aggregatedData is undefined", () => {
      expect(getStatTooltipText(installedStat, undefined)).toBe(
        installedStat.tooltipText,
      );
    });

    it("should include breakdown for installed updates", () => {
      const tooltip = getStatTooltipText(installedStat, mockStats);
      expect(tooltip).toContain(installedStat.tooltipText);
      expect(tooltip).toContain("80 Regular • 20 Security");
    });

    it("should return default tooltip for non-breakdown stats", () => {
      expect(getStatTooltipText(productStat, mockStats)).toBe(
        productStat.tooltipText,
      );
    });
  });
});
