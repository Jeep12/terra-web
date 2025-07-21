export interface ClanMember {
  charName: string;
  online: boolean;
}

export interface Clan {
  clanId: number;
  clanName: string | null;
  clanLevel: number | null;
  reputationScore: number;
  hasCastle: number | null;
  bloodAllianceCount: number;
  bloodOathCount: number;
  allyId: number | null;
  allyName: string | null;
  leaderId: number | null;
  crestId: number | null;
  crestLargeId: number | null;
  allyCrestId: number | null;
  auctionBidAt: number;
  allyPenaltyExpiryTime: number;
  allyPenaltyType: number;
  charPenaltyExpiryTime: number;
  dissolvingExpiryTime: number;
  newLeaderId: number;
  leaderName: string;
  members: ClanMember[];
  totalMembers: number;
  hasWar: boolean;
}
