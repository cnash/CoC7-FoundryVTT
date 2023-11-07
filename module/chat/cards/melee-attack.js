/* global foundry, game, fromUuidSync, CONFIG, ui */
import { EnhancedChatCard } from '../../common/chatcardlib/src/chatcardlib.js'
import { CoCID } from '../../../module/scripts/coc-id.js'
import { CoC7Check } from '../../check.js'
import { chatHelper } from '../helper.js'

export class MeleeAttackCard extends EnhancedChatCard {
  get rollStates () {
    return {
      notRequested: -1,
      requested: 1,
      locked: 2,
      rolled: 3,
      closed: 4
    }
  }

  /**
   * Data initialisation before sending message to chat.
   * @override
   */
  async initialize () {
    // this.data.states = {}
    this.data.objects = {}
    this.data.flags.rulesMode = this.hasTaget // By default, automatic mode is enabled
    this.data.flags.manualMode = !this.hasTaget
    this.data.flags.outnumbered = (this.defender && this.defender.isOutnumbered) // Check if there's a target and that taget is outnumbered already
    this.data.flags.autoHit = true // By default, surprise attacks hit automatically
    const skill = this.attacker.hasPlayerOwner ? await CoCID.fromCoCID('i.skill.stealth') : await CoCID.fromCoCID('i.skill.spot-hidden')
    const skillName = skill.length > 0 ? skill[0].name : ''
    this.data.checks = {
      detection: {
        name: skillName,
        difficulty: CoC7Check.difficultyLevel.regular,
        state: this.rollStates.notRequested
      },
      attack: {
        state: this.rollStates.notRequested
      },
      defense: {
        state: this.rollStates.notRequested
      }
    } // If the target is surprised, and the GM allows we roll by default Stealth for attack, Listen for defence (player should alsways perform the check)
  }

  /**
   * Extend and override the default options
   * @returns {Object}
   */
  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: 'systems/CoC7/templates/chat/cards/melee-attack.hbs'
    })
  }

  /** @override */
  async assignObjects () {
    if (
      this.data.checks.detection.roll &&
      this.data.checks.detection.roll?.constructor?.name === 'Object'
    ) {
      this.data.checks.detection.roll = CoC7Check.fromData(this.data.checks.detection.roll)
    }
  }

  async getData () {
    const data = await super.getData()

    // Get card settings
    data.displayActorOnCard = game.settings.get('CoC7', 'displayActorOnCard')

    // Get card rolls
    if (this.data.checks.detection.roll && (this.data.checks.detection.state >= this.rollStates.rolled)) {
      data.htmlDetectionCheck = await this.data.checks.detection.roll.getHtmlRoll()
      data.htmlDetectionCheckInline = await this.data.checks.detection.roll.inlineCheck?.outerHTML
    }
    return data
  }

  get strings () {
    return {
      youPerformManeuver: () => { return game.i18n.format('CoC7.YouPerformManeuver', { name: this.attackerWeapon.name }) },
      youPerformAttack: () => { return game.i18n.format('CoC7.YouPerformAttack', { name: this.attackerWeapon.name }) }
    }
  }

  get attacker () {
    if (!this.data.actorUuid) return undefined
    if (!this._actor) {
      const doc = fromUuidSync(this.data.actorUuid)
      this._actor = (doc.constructor === CONFIG.Token.documentClass) ? doc.actor : doc
    }
    return this._actor
  }

  get attackerTokenDocument () {
    if (!this.data.actorUuid) return undefined
    if (!this._attackerTokenDocument) {
      const doc = fromUuidSync(this.data.actorUuid)
      if (doc.constructor === CONFIG.Token.documentClass) this._attackerTokenDocument = doc
      else if (doc.token) this._attackerTokenDocument = doc.token
      else this._attackerTokenDocument = undefined
    }
    return this._attackerTokenDocument
  }

  get attackerToken () {
    return this.attackerTokenDocument?._object
  }

  get attackerWeapon () {
    if (!this.data.weaponUuid) return undefined
    if (!this._weapon) this._weapon = fromUuidSync(this.data.weaponUuid)
    return this._weapon
  }

  get attackerSkills () {
    if (!this.attackerWeapon) return null
    if (this.attackerWeapon.type === 'skill') return [this.attackerWeapon]
    return this.attacker.getWeaponSkills(this.data.weaponUuid)
  }

  get isAttackManeuver () {
    if (!this.attackerWeapon) return false
    if (this.attackerWeapon.type === 'skill') return true
    if (this.attackerWeapon.type === 'weapon') return this.attackerWeapon.system.properties.mnvr
    return false
  }

  get defender () {
    if (!this.data.targetUuid) return { name: game.i18n.localize('CoC7.Dummy'), img: 'icons/svg/mystery-man-black.svg', type: undefined }
    if (!this._target) {
      const doc = fromUuidSync(this.data.targetUuid)
      this._target = (doc.constructor === CONFIG.Token.documentClass) ? doc.actor : doc
    }
    return this._target
  }

  get defenderTokenDocument () {
    if (!this.data.targetUuid) return undefined
    if (!this._defenderTokenDocument) {
      const doc = fromUuidSync(this.data.targetUuid)
      if (doc.constructor === CONFIG.Token.documentClass) this._defenderTokenDocument = doc
      else if (doc.token) this._defenderTokenDocument = doc.token
      else this._defenderTokenDocument = undefined
    }
    return this._defenderTokenDocument
  }

  get defenderToken () {
    return this.defenderTokenDocument?._object
  }

  get hasTaget () {
    return undefined !== this.defender.type
  }

  get detectionCheckActor () {
    if (this.attacker.hasPlayerOwner) return this.attacker
    if (this.defender?.hasPlayerOwner) return this.defender
    return this.attacker
  }

  get statusList () {
    const statusList = []
    if (this.isAttackManeuver) {
      statusList.push({ name: game.i18n.localize('CoC7.AttackManeuver'), css: this.attackerCanManeuver ? 'success' : 'failure' })
      if (this.defender) {
        statusList.push({
          name: `${game.i18n.localize('CoC7.Build')}:${this.attacker.build}/${this.defender.build}`,
          css: this.attackerCanManeuver ? 'success' : 'failure'
        })
      }
    }
    if (this.data.thrown) {
      statusList.push({ name: game.i18n.localize('CoC7.Thrown') })
      if (this.distance) {
        statusList.push({ name: game.i18n.format(`CoC7.Distance:${this.distance.value}${this.distance.unit}`), hint: game.i18n.localize('CoC7.ThrownAttackRules') })
      }
      if (this.defenderFightBackOption) {
        statusList.push({ name: game.i18n.localize('CoC7.PointBlank') })
      }
    }
    if (this.data.flags.overrideRules) statusList.push({ name: game.i18n.localize('CoC7.OverrideRules'), hint: game.i18n.localize('CoC7.hint.OverrideRules') })
    if (this.data.flags.outnumbered) statusList.push({ name: game.i18n.localize('CoC7.Outnumbered'), hint: game.i18n.localize('CoC7.hint.TargetOutnumbered') })
    if (this.data.flags.surprised) {
      statusList.push({ name: game.i18n.localize('CoC7.SurpriseAttack'), hint: game.i18n.localize('CoC7.hint.SurpriseAttack') })
      if (this.data.flags.canDetect) {
        if (this.attacker.hasPlayerOwner) statusList.push({ name: game.i18n.localize('CoC7.PlayerTryToSurprise'), hint: game.i18n.localize('CoC7.hint.PlayerShouldBeRolling') })
        else statusList.push({ name: game.i18n.localize('CoC7.PlayerTryToDetect'), hint: game.i18n.localize('CoC7.hint.PlayerShouldBeRolling') })
        if (this.data.checks.detection.state > this.rollStates.notRequested) {
          if (this.hasValidDetectionCheck) statusList.push({ name: `${game.i18n.format('CoC7.Roll')}: ${this.data.checks.detection.name}` })
          if (this.data.checks.detection.state >= this.rollStates.rolled) {
            if (this.data.checks.detection.roll?.passed) statusList.push({ name: game.i18n.localize('CoC7.Success'), css: 'success' })
            else if (this.data.checks.detection.roll.isFumble) statusList.push({ name: game.i18n.localize('CoC7.Fumble'), css: 'fumble' })
            else statusList.push({ name: game.i18n.localize('CoC7.Failure'), css: 'failure' })
          }
        }
      }
      if (this.attackGetSurpriseBonus) {
        if (this.data.flags.suprisedBonusDice) statusList.push({ name: game.i18n.localize('CoC7.GainBonusDie') })
        if (this.data.flags.autoHit) statusList.push({ name: game.i18n.localize('CoC7.AutoHit'), hint: game.i18n.localize('CoC7.hint.AutoHit') })
      }
    }

    if (this.defenderCanManeuver && this.data.flags.maneuver) {
      statusList.push({ name: `${game.i18n.localize('CoC7.Build')}:${this.attacker.build}/${this.defender.build}` })
    }

    if (this.totalAttackBonus !== 0) {
      statusList.push({ name: `${game.i18n.localize('CoC7.AttackModifier')}: ${this.totalAttackBonus}` })
    }

    return statusList
  }

  /**
   * Return the skillcheck to perform for detection
   */
  get detectionCheck () {
    const actor = this.detectionCheckActor
    if (actor) {
      const skill = actor.getSkillsByName(this.data.checks.detection.name)
      if (skill.length > 0) return skill[0]
    }
    return null
  }

  // Surprise is a success, defender is startled and attacker get a bonus
  get defenderStartled () {
    if (!this.flags.surprised) return false
    if (this.data.checks.detection.state !== this.rollStates.closed) return false
    if (this.flags.canDetect) {
      if (this.attacker.hasPlayerOwner && this.data.checks.detection.roll?.passed) return true // Attacker try to surprise and succeed
      if (!this.attacker.hasPlayerOwner && !this.data.checks.detection.roll?.passed) return true // Defender is surprised but see the attack
      return false
    }
    return true
  }

  // If defender
  get defenderCanRespond () {
    if (!this.defender) return false
    if (this.flags.outnumbered) return false
    if (this.flags.surprised) {
      if (this.defenderStartled && this.flags.autoHit) return false
    }
    return true
  }

  get defenderResponseValidated () {
    if (!this.defenderCanRespond) return true
    if (!this.defenderCanDodge && !this.defenderCanFightBack && !this.defenderCanManeuver) return true
    return this.data.checks.defense.state >= this.rollStates.locked
  }

  get defenderCanDodge () {
    return !!(this.defender.dodgeSkill)
  }

  get defenderCanFightBack () {
    return (this.defender.meleeWeapons?.length > 0)
  }

  get defenderCanManeuver () {
    if (!isNaN(this.attacker.build) && !isNaN(this.defender.build) && this.attacker.build <= (this.defender.build + 2)) return (this.defender.meleeManeuvers?.length > 0)
    return false
  }

  get attackerCanManeuver () {
    if (!isNaN(this.attacker.build) && !isNaN(this.defender.build) && this.defender.build <= (this.attacker.build + 2)) return (this.attacker.meleeManeuvers?.length > 0)
    return false
  }

  get surpriseResolved () {
    return !this.data.flags.surprised || (this.data.checks.detection.state === this.rollStates.closed)
  }

  get attackGetSurpriseBonus () {
    return (this.data.flags.surprised && !this.data.flags.canDetect) || // Suprise can't be avoided
    (this.attacker.hasPlayerOwner && this.data.flags.canDetect && this.data.checks.detection.roll?.passed) || // Suprise can be avoided, player initiate attack, check success
    (!this.attacker.hasPlayerOwner && this.data.flags.canDetect && this.data.checks.detection.roll?.isFailure) // Suprise can be avoided, player receive attack, check fail
  }

  get totalAttackBonus () {
    if (this.data.flags.overrideRules) return this.data.bonusDice
    if (this.data.flags.surprised && this.data.flags.autoHit) return 0
    let totalBonus = 0
    if (this.attackGetSurpriseBonus && this.data.flags.suprisedBonusDice) totalBonus += 1
    if (this.data.flags.outnumbered) totalBonus += 1
    return totalBonus
  }

  /**
   * Return true if the card has a valid detection check to propose.
   */
  get hasValidDetectionCheck () {
    return !!this.detectionCheck
  }

  async validateDetectionCheck (options) {
    this.data.checks.detection.state = this.rollStates.requested
    return true
  }

  async rollDetectionCheck (options) {
    this.data.checks.detection.roll = new CoC7Check()
    this.data.checks.detection.roll.actor = this.detectionCheckActor
    this.data.checks.detection.roll.skill = this.detectionCheck
    this.data.checks.detection.roll.difficulty = this.data.checks.detection.difficulty

    if (!this.data.checks.detection.roll) return false
    await this.data.checks.detection.roll._perform({ forceDSN: true })
    this.data.checks.detection.state = this.rollStates.rolled
    return true
  }

  async useLuck (options) {
    const div = options.event.currentTarget.closest('[data-roll]')
    const roll = div.dataset.roll
    await CoC7Check.alter(this.data.checks[roll].roll, 'useLuck', {
      target: options.event.currentTarget,
      update: false
    })
    return true
  }

  async resolveSurpriseAttack (options) {
    this.data.checks.detection.state = this.rollStates.closed
    return true
  }

  async requestAttack (options) {
    this.data.checks.attack.state = this.rollStates.requested
    this.data.checks.defense.state = this.defenderCanRespond ? this.rollStates.requested : this.rollStates.closed
    return true
  }

  async rollAttackCheck (options) {
    if (this.data.checks.defense.state >= this.rollStates.locked) return this.resolveCard()
    ui.notifications.info('Card not resolved')
    return true
  }

  async chooseToFightBack (options) {
    this.data.checks.defense.state = this.rollStates.locked
    this.data.checks.defense.alternativeSkill = !!options.event.target.dataset.alternative
    return true
  }

  async chooseToManeuver (options) {
    this.data.checks.defense.state = this.rollStates.locked
    this.data.checks.defense.alternativeSkill = !!options.event.target.dataset.alternative
    return true
  }

  async chooseToDodge (options) {
    this.data.checks.defense.state = this.rollStates.locked
    return true
  }

  async chooseToDoNothing (options) {
    this.data.checks.defense.state = this.rollStates.locked
    return true
  }

  get fightBackWeapon () {
    return this.defender.meleeWeapons.find((wp) => wp.uuid === this.data.checks.defense.name)
  }

  get defenseManeuver () {
    return this.defender.meleeManeuvers.find((mn) => mn.uuid === this.data.checks.defense.name)
  }

  async resolveCard () {
    ui.notifications.info('Resolving card')
    if (
      this.defenderCanRespond &&
      this.data.checks.defense.state === this.rollStates.locked &&
      this.defender) {
      if (this.data.flags.doNothing) this.data.checks.defense.roll = null
      else {
        this.data.checks.defense.roll = new CoC7Check()
        this.data.checks.defense.roll.actor = this.defender
        this.data.checks.defense.roll.difficulty = CoC7Check.difficultyLevel.regular
        if (this.flags.dodge) this.data.checks.skill = this.defender.dodgeSkill
        else if (this.flags.maneuver) {
          if (this.defenseManeuver.specialManeuver) {
            this.data.checks.defense.roll.item = this.defenseManeuver
          }
          this.data.checks.defense.roll.skill = this.data.checks.defense.alternativeSkill ? this.defenseManeuver.skills.alternativ : this.defenseManeuver.skills.main
          if (!isNaN(this.attacker.build) && !isNaN(this.defender.build)) {
            if (this.defender.build <= this.attacker.build - 2) this.data.checks.defense.roll.diceModifier = -2
            if (this.defender.build <= this.attacker.build - 1) this.data.checks.defense.roll.diceModifier = -1
          }
        } else if (this.flags.fightBack) {
          this.data.checks.defense.roll.item = this.fightBackWeapon
          this.data.checks.defense.roll.skill = this.data.checks.defense.alternativeSkill ? this.fightBackWeapon.skills.alternativ : this.fightBackWeapon.skills.main
        }
      }
      await this.data.checks.defense.roll._perform({ forceDSN: true })
      this.data.checks.defense.state = this.rollStates.rolled
    }
    return true
  }

  get distance () {
    return (this.attackerToken && this.defenderToken) ? chatHelper.getDistance(this.attackerToken, this.defenderToken) : null
  }
}