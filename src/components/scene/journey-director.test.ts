import { describe, expect, it } from "vitest";
import { chapterAt, journeyChapters } from "@/data/journey";
import { journeyShot, type StageLayout } from "./journey-director";
import { POINTS } from "./scene-config";

const desktop: StageLayout = { zoom: 1, ax: 0.5, ay: 0.52, portrait: false };
const phone: StageLayout = { zoom: 1.6, ax: 0.5, ay: 0.47, portrait: true };

describe("a termékutazás rendezője", () => {
  it("a nyitón a reggeli jelenet áll, klasszikus címkével, az alapelrendezésben", () => {
    const shot = journeyShot(0, desktop, 0);
    expect(shot.scene).toBe("reggel");
    expect(shot.blend).toBe(0);
    expect(shot.label).toBe(0);
    expect(shot.pair).toBe(0);
    expect(shot.zoom).toBeCloseTo(1);
    expect(shot.anchor).toEqual([0.5, 0.52]);
    expect(shot.focus).toEqual(POINTS.center);
  });

  it("a közeliken nagyít, álló kijelzőn az üveget feljebb teszi", () => {
    const wide = journeyShot(0.45, desktop, 0);
    const tall = journeyShot(0.45, phone, 0);
    expect(wide.zoom).toBeGreaterThan(5);
    expect(wide.anchor[0]).toBeGreaterThan(0.5);
    expect(tall.anchor).toEqual([0.5, 0.4]);
  });

  it("estére jelenetet és címkét vált", () => {
    const shot = journeyShot(0.82, desktop, 0);
    expect(shot.scene).toBe("este");
    expect(shot.label).toBe(1);
    expect(shot.pair).toBe(0);
  });

  it("a végén a páros jelenetben mindkét üveg ott áll", () => {
    const shot = journeyShot(1, desktop, 0);
    expect(shot.scene).toBe("paros");
    expect(shot.nextScene).toBe("paros");
    expect(shot.pair).toBe(1);
    expect(shot.followMain).toBeFalsy();
  });

  it("álló kijelzőn a páros kisebb nagyítást kap, hogy kiférjen", () => {
    const wide = journeyShot(1, desktop, 0).zoom / desktop.zoom;
    const tall = journeyShot(1, phone, 0).zoom / phone.zoom;
    expect(tall).toBeLessThan(wide);
  });

  it("a nagyítás és az áttűnés végig értelmes tartományban marad", () => {
    for (let i = 0; i <= 200; i++) {
      const shot = journeyShot(i / 200, desktop, 0);
      expect(shot.zoom).toBeGreaterThan(0.9);
      expect(shot.zoom).toBeLessThan(8);
      expect(shot.blend).toBeGreaterThanOrEqual(0);
      expect(shot.blend).toBeLessThanOrEqual(1);
    }
  });
});

describe("fejezetek", () => {
  it("hézag és átfedés nélkül fedik le a görgetést", () => {
    expect(journeyChapters[0].from).toBe(0);
    for (let i = 1; i < journeyChapters.length; i++) {
      expect(journeyChapters[i].from).toBe(journeyChapters[i - 1].to);
    }
    expect(journeyChapters.at(-1)!.to).toBeGreaterThan(1);
  });

  it("a görgetés állásából a megfelelő fejezetet adja", () => {
    expect(chapterAt(0)).toBe(0);
    expect(journeyChapters[chapterAt(0.45)].id).toBe("vonal");
    expect(journeyChapters[chapterAt(0.8)].id).toBe("este");
    expect(chapterAt(1)).toBe(journeyChapters.length - 1);
  });

  it("minden fejezet a jelenetének megfelelő terméket kínálja", () => {
    expect(journeyChapters.find((c) => c.id === "este")!.product).toBe("sleep");
    expect(journeyChapters.find((c) => c.id === "paros")!.product).toBe("bundle");
  });
});
