/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
package org.sonar.duplications.block;

import java.util.ArrayList;
import org.sonar.duplications.statement.Statement;

import java.util.Collections;
import java.util.List;

/**
 * Creates blocks from statements, each block will contain specified number of statements (<code>blockSize</code>) and 64-bits (8-bytes) hash value.
 * Hash value computed using
 * <a href="http://en.wikipedia.org/wiki/Rolling_hash#Rabin-Karp_rolling_hash">Rabin-Karp rolling hash</a> :
 * <blockquote><pre>
 * s[0]*31^(blockSize-1) + s[1]*31^(blockSize-2) + ... + s[blockSize-1]
 * </pre></blockquote>
 * using <code>long</code> arithmetic, where <code>s[i]</code>
 * is the hash code of <code>String</code> (which is cached) for statement with number i.
 * Thus running time - O(N), where N - number of statements.
 * Implementation fully thread-safe.
 */
package org.sonar.duplications.block;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class BlockChunker {

  private static final long PRIME_BASE = 31;
  private final int blockSize;
  private final long power;

  public BlockChunker(int blockSize) {
    this.blockSize = blockSize;
    this.power = calculatePower(blockSize);
  }

  private long calculatePower(int blockSize) {
    long pow = 1;
    for (int i = 0; i < blockSize - 1; i++) {
      pow *= PRIME_BASE;
    }
    return pow;
  }

  public List<Block> chunk(String resourceId, List<Statement> statements) {
    statements = filterStatements(statements);
    if (statements.size() < blockSize) {
      return Collections.emptyList();
    }

    Statement[] statementsArr = statements.toArray(new Statement[0]);
    List<Block> blocks = new ArrayList<>(statementsArr.length - blockSize + 1);

    Block.Builder blockBuilder = Block.builder().setResourceId(resourceId);
    long hash = initializeHash(statementsArr);

    for (int last = blockSize - 1, first = 0; last < statementsArr.length; last++, first++) {
      Statement firstStatement = statementsArr[first];
      Statement lastStatement = statementsArr[last];

      hash = updateHash(hash, firstStatement, lastStatement);
      Block block = createBlock(blockBuilder, hash, first, firstStatement, lastStatement);
      blocks.add(block);

      hash = removeFirstStatementFromHash(hash, firstStatement);
    }

    return blocks;
  }

  private List<Statement> filterStatements(List<Statement> statements) {
    List<Statement> filtered = new ArrayList<>();
    for (int i = 0, j; i < statements.size(); i = j) {
      Statement first = statements.get(i);
      j = i + 1;
      while (j < statements.size() && statements.get(j).getValue().equals(first.getValue())) {
        j++;
      }
      filtered.add(first);
      if (i < j - 1) {
        filtered.add(statements.get(j - 1));
      }
    }
    return filtered;
  }

  private long initializeHash(Statement[] statementsArr) {
    long hash = 0;
    for (int i = 0; i < blockSize - 1; i++) {
      hash = hash * PRIME_BASE + statementsArr[i].getValue().hashCode();
    }
    return hash;
  }

  private long updateHash(long hash, Statement firstStatement, Statement lastStatement) {
    return hash * PRIME_BASE + lastStatement.getValue().hashCode();
  }

  private Block createBlock(Block.Builder blockBuilder, long hash, int index, Statement firstStatement, Statement lastStatement) {
    return blockBuilder.setBlockHash(new ByteArray(hash))
        .setIndexInFile(index)
        .setLines(firstStatement.getStartLine(), lastStatement.getEndLine())
        .build();
  }

  private long removeFirstStatementFromHash(long hash, Statement firstStatement) {
    return hash - power * firstStatement.getValue().hashCode();
  }

  public int getBlockSize() {
    return blockSize;
  }

}
